import { errorResponse } from "@/lib/api/responses";

export function withErrorHandling(handler: CallableFunction) {
  return async (...args: unknown[]) => {
    try {
      return await handler(...args);
    } catch (err) {
      return errorResponse(err);
    }
  }
}