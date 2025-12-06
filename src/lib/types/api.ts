export type SuccessResponse<T> = {
  success: true;
  data: T;
  meta: {
    requestId: string;
    timestamp: string;
  };
};

export type ErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    status: number;
    type: string;
    fields?: Record<string, string[]>;
  };
  meta: {
    requestId: string;
    timestamp: string;
  };
};

export type ApiResponse<T = never> = SuccessResponse<T> | ErrorResponse;
