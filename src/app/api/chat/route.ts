import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { ChatMessageSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { errorResponse, RateLimitError, InsufficientCreditsError } from "@/lib/errors";
import { logger, generateRequestId } from "@/lib/logger";
import { aiRouter } from "@/lib/ai/router";

const SYSTEM_PROMPT = `You are Vizzy, a creative AI assistant specializing in visual content creation.
You help users create images, videos, posters, stories, and marketing assets through natural conversation.
When a user describes what they want, you should:
1. Understand their creative intent
2. Suggest specific visual approaches
3. Offer to generate the content
4. Be concise and inspiring in your responses
5. Ask clarifying questions when the request is ambiguous
Always be encouraging and help users refine their creative vision.`;

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    logger.request({ method: "POST", url: "/api/chat" }, requestId);

    const user = await getAuthUser();

    // Rate limiting
    const rateCheck = await checkRateLimit(user.id, "chat");
    if (!rateCheck.allowed) {
      throw new RateLimitError();
    }

    // Credit check
    if (user.credits <= 0) {
      throw new InsufficientCreditsError(1, user.credits);
    }

    const body = await request.json();
    const validated = ChatMessageSchema.parse(body);

    // Get or create conversation
    let conversationId = validated.conversationId;

    if (!conversationId) {
      const conv = await prisma.conversation.create({
        data: {
          userId: user.id,
          title: validated.content.substring(0, 80),
        },
      });
      conversationId = conv.id;
    } else {
      // Verify ownership
      const conv = await prisma.conversation.findFirst({
        where: { id: conversationId, userId: user.id },
      });
      if (!conv) {
        return errorResponse(new Error("Conversation not found"));
      }
    }

    // Store user message
    await prisma.message.create({
      data: {
        conversationId,
        role: "user",
        content: validated.content,
        contentType: validated.contentType,
      },
    });

    // Fetch conversation history
    const history = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      take: 50,
    });

    // Build messages for AI
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.map((m: { role: string; content: string }) => ({ role: m.role, content: m.content })),
    ];

    // Stream AI response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let fullContent = "";

        try {
          for await (const chunk of aiRouter.chatCompletionStream({ messages })) {
            fullContent += chunk;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content: chunk, done: false })}\n\n`)
            );
          }

          // Store assistant message
          const assistantMsg = await prisma.message.create({
            data: {
              conversationId,
              role: "assistant",
              content: fullContent,
              contentType: "text",
            },
          });

          // Deduct credit
          await prisma.user.update({
            where: { id: user.id },
            data: { credits: { decrement: 1 } },
          });

          // Update conversation timestamp
          await prisma.conversation.update({
            where: { id: conversationId! },
            data: { updatedAt: new Date() },
          });

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                done: true,
                messageId: assistantMsg.id,
                conversationId,
                creditsRemaining: user.credits - 1,
              })}\n\n`
            )
          );
        } catch (streamError) {
          logger.error("Stream error", {
            requestId,
            userId: user.id,
            error: String(streamError),
          });
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "Streaming failed", done: true })}\n\n`
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    logger.info("Chat message processed", {
      requestId,
      userId: user.id,
      duration: Date.now() - startTime,
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Request-Id": requestId,
      },
    });
  } catch (error) {
    logger.error("Chat error", {
      requestId,
      duration: Date.now() - startTime,
      error: String(error),
    });
    return errorResponse(error);
  }
}
