import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { GenerateAssetSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  errorResponse,
  successResponse,
  RateLimitError,
  InsufficientCreditsError,
  NotFoundError,
} from "@/lib/errors";
import { logger, generateRequestId } from "@/lib/logger";
import { aiRouter } from "@/lib/ai/router";

const CREDIT_COST: Record<string, number> = {
  image: 5,
  poster: 5,
  storyboard: 8,
  moodboard: 3,
  video: 15,
};

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    logger.request({ method: "POST", url: "/api/generate" }, requestId);

    const user = await getAuthUser();

    // Rate limiting
    const rateCheck = await checkRateLimit(user.id, "generate");
    if (!rateCheck.allowed) {
      throw new RateLimitError();
    }

    const body = await request.json();
    const validated = GenerateAssetSchema.parse(body);

    const creditCost = CREDIT_COST[validated.assetType] || 5;

    // Credit check
    if (user.credits < creditCost) {
      throw new InsufficientCreditsError(creditCost, user.credits);
    }

    // Verify message ownership if provided
    if (validated.messageId) {
      const message = await prisma.message.findFirst({
        where: {
          id: validated.messageId,
          conversation: { userId: user.id },
        },
      });
      if (!message) throw new NotFoundError("Message");
    }

    // Generate assets
    const startTimeGen = Date.now();
    const results = await aiRouter.generateImage({
      prompt: validated.prompt,
      width: validated.width,
      height: validated.height,
      style: validated.style,
      n: validated.count,
    });
    const generationTime = Date.now() - startTimeGen;

    // Create assistant message for the assets
    const message = await prisma.message.create({
      data: {
        conversationId: validated.conversationId || "",
        role: "assistant",
        content: `Generated ${results.length} ${validated.assetType}(s) based on: "${validated.prompt}"`,
        contentType: validated.assetType,
        metadata: {
          generationTime,
          model: "gpt-image-1",
          provider: "openai",
        },
      },
    });

    // Store assets
    const assets = await Promise.all(
      results.map((result) =>
        prisma.generatedAsset.create({
          data: {
            messageId: message.id,
            assetType: validated.assetType,
            prompt: result.revisedPrompt || validated.prompt,
            storageUrl: result.url,
            width: validated.width,
            height: validated.height,
            format: "png",
            metadata: {
              ...result.metadata,
              seed: result.seed,
              revisedPrompt: result.revisedPrompt,
            },
          },
        })
      )
    );

    // Deduct credits
    const totalCost = creditCost * results.length;
    await prisma.user.update({
      where: { id: user.id },
      data: { credits: { decrement: totalCost } },
    });

    // Update conversation
    if (validated.conversationId) {
      await prisma.conversation.update({
        where: { id: validated.conversationId },
        data: { updatedAt: new Date() },
      });
    }

    logger.info("Assets generated", {
      requestId,
      userId: user.id,
      duration: Date.now() - startTime,
      metadata: {
        assetType: validated.assetType,
        count: results.length,
        generationTime,
      },
    });

    return successResponse({
      message: {
        id: message.id,
        content: message.content,
      },
      assets: assets.map((a: { id: string; assetType: string; storageUrl: string | null; thumbnailUrl: string | null; prompt: string; width: number | null; height: number | null; format: string | null; metadata: unknown }) => ({
        id: a.id,
        type: a.assetType,
        url: a.storageUrl,
        thumbnailUrl: a.thumbnailUrl,
        prompt: a.prompt,
        width: a.width,
        height: a.height,
        format: a.format,
        metadata: a.metadata,
      })),
      credits: {
        used: totalCost,
        remaining: user.credits - totalCost,
      },
    });
  } catch (error) {
    logger.error("Generate error", {
      requestId,
      duration: Date.now() - startTime,
      error: String(error),
    });
    return errorResponse(error);
  }
}
