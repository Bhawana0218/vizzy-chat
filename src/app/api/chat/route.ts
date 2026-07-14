export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { ChatMessageSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { RateLimitError, InsufficientCreditsError } from "@/lib/errors";
import { logger, generateRequestId } from "@/lib/logger";
import { getMockResponse } from "@/lib/mock-data";
import { enhancePrompt, getMockResponseForIntent } from "@/lib/ai/prompt-engine";

const SYSTEM_PROMPT = `You are Vizzy, a creative AI assistant specializing in visual content creation for businesses and individuals.

## Core Capabilities
- Generate images, videos, posters, storyboards, moodboards, and marketing assets
- Transform photos into art (renaissance, impressionist, pop art, etc.)
- Create campaign concepts, brand artwork, and social media content
- Visualize emotions, dreams, and abstract concepts
- Build storyboards and children's book illustrations

## Response Guidelines
1. Be concise, inspiring, and action-oriented
2. When users describe what they want, confirm the creative direction and suggest specifics
3. Use vivid language to describe the visual approach you'll take
4. Offer 2-4 asset variations when generating
5. Ask one clarifying question if the request is ambiguous
6. Reference visual elements: color palettes, composition, lighting, mood, style
7. Always end with a clear next step or question

## Style Notes
- Match the user's mood: playful for fun requests, sophisticated for premium requests
- Suggest aspect ratios and formats appropriate for the intended use
- When users say "make it premium" or "more elegant," emphasize luxury aesthetics`;

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    logger.request({ method: "POST", url: "/api/chat" }, requestId);

    let user;
    try {
      user = await getAuthUser();
    } catch {
      logger.warn("Auth failed, using mock user", { requestId });
      user = { id: "mock-user", email: "mock@vizzy.app", name: "Mock User", avatarUrl: null, credits: 1000, plan: "creator" };
    }

    const rateCheck = await checkRateLimit(user.id, "chat").catch(() => ({ allowed: true, remaining: 30, resetAt: new Date() }));
    if (!rateCheck.allowed) {
      throw new RateLimitError();
    }

    if (user.credits <= 0) {
      throw new InsufficientCreditsError(1, user.credits);
    }

    const body = await request.json();
    const validated = ChatMessageSchema.parse(body);

    let conversationId: string | null = validated.conversationId || null;

    if (conversationId) {
      try {
        const conv = await prisma.conversation.findFirst({
          where: { id: conversationId, userId: user.id },
        });
        if (!conv) {
          conversationId = null;
        }
      } catch {
        conversationId = null;
      }
    }

    if (!conversationId) {
      try {
        const conv = await prisma.conversation.create({
          data: {
            userId: user.id,
            title: validated.content.substring(0, 80),
          },
        });
        conversationId = conv.id;
      } catch {
        conversationId = `mock-conv-${Date.now()}`;
      }
    }

    if (conversationId && !conversationId.startsWith("mock-")) {
      try {
        await prisma.message.create({
          data: {
            conversationId,
            role: "user",
            content: validated.content,
            contentType: validated.contentType,
          },
        });
      } catch {
        // mock mode
      }
    }

    let history: { role: string; content: string }[] = [];
    if (conversationId && !conversationId.startsWith("mock-")) {
      try {
        const msgs = await prisma.message.findMany({
          where: { conversationId },
          orderBy: { createdAt: "asc" },
          take: 50,
        });
        history = msgs.map((m) => ({ role: m.role, content: m.content }));
      } catch {
        // mock mode
      }
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history,
    ];

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

          if (conversationId && !conversationId.startsWith("mock-")) {
            try {
              await prisma.message.create({
                data: {
                  conversationId,
                  role: "assistant",
                  content: fullContent,
                  contentType: "text",
                },
              });
              await prisma.user.update({
                where: { id: user.id },
                data: { credits: { decrement: 1 } },
              });
              await prisma.conversation.update({
                where: { id: conversationId },
                data: { updatedAt: new Date() },
              });
            } catch {
              // mock mode
            }
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                done: true,
                messageId: `msg-${Date.now()}`,
                conversationId,
                creditsRemaining: user.credits - 1,
              })}\n\n`
            )
          );
        } catch (streamError) {
          logger.error("AI stream failed, falling back to mock response", {
            requestId,
            userId: user.id,
            error: String(streamError),
          });

          const enhanced = enhancePrompt(validated.content, false);
          const mockResp = getMockResponse(validated.content);
          const intentResp = getMockResponseForIntent(enhanced);
          const responseText = intentResp || mockResp.text;

          const words = responseText.split(" ");
          let acc = "";
          for (let i = 0; i < words.length; i++) {
            acc += (i > 0 ? " " : "") + words[i];
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content: acc, done: false })}\n\n`)
            );
            await new Promise((r) => setTimeout(r, 15));
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                done: true,
                messageId: `mock-msg-${Date.now()}`,
                conversationId,
                creditsRemaining: user.credits,
              })}\n\n`
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

    const enhanced = enhancePrompt(
      (() => { try { return JSON.parse("{}").content || ""; } catch { return ""; } })() || "creative prompt",
      false
    );
    const mockResp = getMockResponse("creative prompt");
    const intentResp = getMockResponseForIntent(enhanced);
    const responseText = intentResp || mockResp.text;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const words = responseText.split(" ");
        let acc = "";
        let i = 0;
        const interval = setInterval(() => {
          if (i >= words.length) {
            clearInterval(interval);
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ done: true, messageId: `fallback-${Date.now()}`, conversationId: null, creditsRemaining: 999 })}\n\n`)
            );
            controller.close();
            return;
          }
          acc += (i > 0 ? " " : "") + words[i];
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: acc, done: false })}\n\n`));
          i++;
        }, 20);
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Request-Id": requestId,
      },
    });
  }
}

import { aiRouter } from "@/lib/ai/router";
