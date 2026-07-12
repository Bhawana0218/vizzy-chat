import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { UpdateConversationSchema } from "@/lib/validation";
import { errorResponse, successResponse, NotFoundError } from "@/lib/errors";
import { logger, generateRequestId } from "@/lib/logger";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/conversations/:id
export async function GET(request: NextRequest, { params }: RouteParams) {
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    logger.request({ method: "GET", url: `/api/conversations/:id` }, requestId);

    const user = await getAuthUser();
    const { id } = await params;

    const conversation = await prisma.conversation.findFirst({
      where: { id, userId: user.id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            assets: {
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundError("Conversation");
    }

    logger.info("Conversation fetched", {
      requestId,
      userId: user.id,
      duration: Date.now() - startTime,
    });

    return successResponse(conversation);
  } catch (error) {
    logger.error("Fetch conversation error", {
      requestId,
      duration: Date.now() - startTime,
      error: String(error),
    });
    return errorResponse(error);
  }
}

// PATCH /api/conversations/:id
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    logger.request({ method: "PATCH", url: `/api/conversations/:id` }, requestId);

    const user = await getAuthUser();
    const { id } = await params;
    const body = await request.json();
    const validated = UpdateConversationSchema.parse(body);

    const existing = await prisma.conversation.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      throw new NotFoundError("Conversation");
    }

    const updated = await prisma.conversation.update({
      where: { id },
      data: validated,
    });

    logger.info("Conversation updated", {
      requestId,
      userId: user.id,
      duration: Date.now() - startTime,
    });

    return successResponse(updated);
  } catch (error) {
    logger.error("Update conversation error", {
      requestId,
      duration: Date.now() - startTime,
      error: String(error),
    });
    return errorResponse(error);
  }
}

// DELETE /api/conversations/:id
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    logger.request({ method: "DELETE", url: `/api/conversations/:id` }, requestId);

    const user = await getAuthUser();
    const { id } = await params;

    const existing = await prisma.conversation.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      throw new NotFoundError("Conversation");
    }

    // Cascading delete handles messages and assets
    await prisma.conversation.delete({ where: { id } });

    logger.info("Conversation deleted", {
      requestId,
      userId: user.id,
      duration: Date.now() - startTime,
    });

    return successResponse({ deleted: true });
  } catch (error) {
    logger.error("Delete conversation error", {
      requestId,
      duration: Date.now() - startTime,
      error: String(error),
    });
    return errorResponse(error);
  }
}
