import { errorResponse } from "@/lib/api/responses";
import { ApiError } from "@/lib/api/errors";
import { logger } from "@/lib/logger";

const log = logger.child({ module: 'api/http' });

export function withErrorHandling(handler: CallableFunction) {
  return async (...args: unknown[]) => {
    try {
      return await handler(...args);
    } catch (err) {
      if (!(err instanceof ApiError)) {
        log.error(err, 'Unexpected error in API handler');
      }

      return errorResponse(err);
    }
  }
}

export function withPrivateErrorHandling(handler: CallableFunction) {
  const wrapped = withErrorHandling(handler);
  return async (...args: unknown[]) => {
    const response = await wrapped(...args);
    response.headers.set('Cache-Control', 'private, no-store');
    return response;
  };
}