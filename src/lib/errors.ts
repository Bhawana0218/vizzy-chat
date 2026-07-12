import { NextResponse } from "next/server";

// ─── Custom Error Classes ────────────────────────────────────

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = "INTERNAL_ERROR",
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Insufficient permissions") {
    super(message, 403, "FORBIDDEN");
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, "NOT_FOUND");
  }
}

export class ValidationError extends AppError {
  constructor(details: Record<string, unknown>) {
    super("Validation failed", 422, "VALIDATION_ERROR", details);
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter = 60) {
    super("Rate limit exceeded", 429, "RATE_LIMIT_EXCEEDED", { retryAfter });
  }
}

export class InsufficientCreditsError extends AppError {
  constructor(needed: number, available: number) {
    super("Insufficient credits", 402, "INSUFFICIENT_CREDITS", {
      needed,
      available,
    });
  }
}

export class AIServiceError extends AppError {
  constructor(provider: string, cause?: string) {
    super(
      `AI service error: ${provider}${cause ? ` - ${cause}` : ""}`,
      502,
      "AI_SERVICE_ERROR",
      { provider, cause }
    );
  }
}

// ─── Error Response Helper ───────────────────────────────────

export function errorResponse(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      { status: error.statusCode }
    );
  }

  console.error("[Unhandled Error]", error);

  return NextResponse.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      },
    },
    { status: 500 }
  );
}

// ─── Success Response Helper ─────────────────────────────────

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  return NextResponse.json({
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  });
}
