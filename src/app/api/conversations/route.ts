import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { CreateConversationSchema, PaginationSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { errorResponse, successResponse, paginatedResponse, RateLimitError } from "@/lib/errors";
import { logger, generateRequestId } from "@/lib/logger";

// GET /api/conversations - List user conversations
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    logger.request({ method: "GET", url: "/api/conversations" }, requestId);

    const user = await getAuthUser();

    const { searchParams } = new URL(request.url);
    const pagination = PaginationSchema.parse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    });

    const where = {
      userId: user.id,
      isArchived: false,
    };

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        include: {
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              id: true,
              content: true,
              role: true,
              contentType: true,
            },
          },
          _count: {
            select: { messages: true },
          },
        },
      }),
      prisma.conversation.count({ where }),
    ]);

    logger.info("Conversations fetched", {
      requestId,
      userId: user.id,
      duration: Date.now() - startTime,
    });

    return paginatedResponse(conversations, total, pagination.page, pagination.limit);
  } catch (error) {
    logger.error("Fetch conversations error", {
      requestId,
      duration: Date.now() - startTime,
      error: String(error),
    });
    return errorResponse(error);
  }
}

// POST /api/conversations - Create a new conversation
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    logger.request({ method: "POST", url: "/api/conversations" }, requestId);

    const user = await getAuthUser();

    const rateCheck = await checkRateLimit(user.id, "conversations");
    if (!rateCheck.allowed) {
      throw new RateLimitError();
    }

    const body = await request.json();
    const validated = CreateConversationSchema.parse(body);

    const conversation = await prisma.conversation.create({
      data: {
        userId: user.id,
        title: validated.title || "New conversation",
      },
    });

    logger.info("Conversation created", {
      requestId,
      userId: user.id,
      duration: Date.now() - startTime,
    });

    return successResponse(conversation, 201);
  } catch (error) {
    logger.error("Create conversation error", {
      requestId,
      duration: Date.now() - startTime,
      error: String(error),
    });
    return errorResponse(error);
  }
}
