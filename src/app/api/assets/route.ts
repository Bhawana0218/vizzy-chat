import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { PaginationSchema, UpdateAssetSchema } from "@/lib/validation";
import { errorResponse, successResponse, paginatedResponse, NotFoundError } from "@/lib/errors";
import { logger, generateRequestId } from "@/lib/logger";

// GET /api/assets - Fetch user's generated assets
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    logger.request({ method: "GET", url: "/api/assets" }, requestId);

    const user = await getAuthUser();

    const { searchParams } = new URL(request.url);
    const pagination = PaginationSchema.parse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    });

    const assetType = searchParams.get("type");
    const favoritesOnly = searchParams.get("favorites") === "true";

    const where = {
      message: {
        conversation: { userId: user.id },
      },
      ...(assetType ? { assetType } : {}),
      ...(favoritesOnly ? { isFavorite: true } : {}),
    };

    const [assets, total] = await Promise.all([
      prisma.generatedAsset.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        include: {
          message: {
            select: {
              id: true,
              conversationId: true,
              content: true,
            },
          },
        },
      }),
      prisma.generatedAsset.count({ where }),
    ]);

    logger.info("Assets fetched", {
      requestId,
      userId: user.id,
      duration: Date.now() - startTime,
    });

    return paginatedResponse(assets, total, pagination.page, pagination.limit);
  } catch (error) {
    logger.error("Fetch assets error", {
      requestId,
      duration: Date.now() - startTime,
      error: String(error),
    });
    return errorResponse(error);
  }
}

// PATCH /api/assets - Update asset (favorite, etc.)
export async function PATCH(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    logger.request({ method: "PATCH", url: "/api/assets" }, requestId);

    const user = await getAuthUser();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return errorResponse(new Error("Asset ID is required"));
    }

    const validated = UpdateAssetSchema.parse(updates);

    // Verify ownership
    const existing = await prisma.generatedAsset.findFirst({
      where: {
        id,
        message: {
          conversation: { userId: user.id },
        },
      },
    });

    if (!existing) {
      throw new NotFoundError("Asset");
    }

    const updated = await prisma.generatedAsset.update({
      where: { id },
      data: validated,
    });

    logger.info("Asset updated", {
      requestId,
      userId: user.id,
      duration: Date.now() - startTime,
    });

    return successResponse(updated);
  } catch (error) {
    logger.error("Update asset error", {
      requestId,
      duration: Date.now() - startTime,
      error: String(error),
    });
    return errorResponse(error);
  }
}

// DELETE /api/assets - Delete asset
export async function DELETE(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    logger.request({ method: "DELETE", url: "/api/assets" }, requestId);

    const user = await getAuthUser();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return errorResponse(new Error("Asset ID is required"));
    }

    // Verify ownership
    const existing = await prisma.generatedAsset.findFirst({
      where: {
        id,
        message: {
          conversation: { userId: user.id },
        },
      },
    });

    if (!existing) {
      throw new NotFoundError("Asset");
    }

    await prisma.generatedAsset.delete({ where: { id } });

    logger.info("Asset deleted", {
      requestId,
      userId: user.id,
      duration: Date.now() - startTime,
    });

    return successResponse({ deleted: true });
  } catch (error) {
    logger.error("Delete asset error", {
      requestId,
      duration: Date.now() - startTime,
      error: String(error),
    });
    return errorResponse(error);
  }
}
