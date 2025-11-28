import crypto from "node:crypto";
import dayjs from "dayjs";
import { ApiError } from "@/lib/api/errors";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ErrorResponse, SuccessResponse } from "@/lib/types/api";
import { ERROR, MESSAGE } from "@/lib/api/error-codes";

export function successResponse<T>(data: T, requestId?: string) {
  return NextResponse.json({
    success: true,
    data,
    meta: {
      requestId: requestId ?? crypto.randomUUID(),
      timestamp: dayjs().toISOString()
    }
  } as SuccessResponse<T>);
}

export function errorResponse<T>(err: T, requestId?: string) {
  const reqId = requestId ?? crypto.randomUUID();

  // --- Caso 1: Error Zod ---
  if (err instanceof ZodError) {
    const fieldErrors: Record<string, string[]> = {};

    for (const issue of err.issues) {
      const field = issue.path.join(".") || "_base";

      if (!fieldErrors[field]) fieldErrors[field] = [];
      fieldErrors[field].push(issue.message);
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: ERROR.VALIDATION_ERROR,
          message: MESSAGE.INVALID_REQUEST,
          status: 422,
          type: "validation_error",
          fields: fieldErrors,
        },
        meta: {
          requestId: reqId,
          timestamp: new Date().toISOString(),
        },
      } as ErrorResponse,
      { status: 422 }
    );
  }

  // --- Caso 2: ApiError custom ---
  const isApiError = err instanceof ApiError && "code" in err;
  const status = isApiError ? err.status : 500;

  return NextResponse.json(
    {
      success: false,
      error: {
        code: isApiError ? err.code : ERROR.INTERNAL_ERROR,
        message: isApiError ? err.message : MESSAGE.INTERNAL_ERROR,
        status,
        type: isApiError ? err.type : "server_error",
        fields: isApiError ? err.fields : undefined,
      },
      meta: {
        requestId: reqId,
        timestamp: new Date().toISOString(),
      },
    } as ErrorResponse,
    { status }
  );
}