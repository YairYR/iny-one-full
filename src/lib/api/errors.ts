import { MESSAGE, ERROR } from "@/lib/api/error-codes";

type ApiErrOptions = {
  type?: string;
  status?: number;
  fields?: Record<string, string[]>;
}

export class ApiError extends Error {
  status: number;
  code: string;
  fields?: Record<string, string[]>;
  type: string;

  constructor(
    code: string,
    message: string,
    options: ApiErrOptions = {},
  ) {
    super(message);
    this.code = code;
    this.message = message;
    this.status = options.status || 400;
    this.type = options.type || 'api_error';
    this.fields = options.fields;
  }
}

export class Api404Error extends ApiError {
  constructor(message?: string|null, options?: PayloadError) {
    super(
      ERROR.NOT_FOUND,
      message ?? MESSAGE.NOT_FOUND,
      options ?? { status: 404 }
    );
  }
}

export class PayloadError extends ApiError {
  constructor(message?: string|null, options?: PayloadError) {
    super(
      ERROR.INVALID_PAYLOAD,
      message ?? MESSAGE.INVALID_PAYLOAD,
      options ?? { status: 400 }
    );
  }
}

export class ValidationError extends ApiError {
  constructor(message?: string|null, options?: ApiErrOptions) {
    super(
      ERROR.VALIDATION_ERROR,
      message ?? MESSAGE.INVALID_REQUEST,
      options ?? { status: 422 });
  }
}

export class ServiceError extends ApiError {
  constructor(message?: string|null, options?: ApiErrOptions) {
    super(
      ERROR.SERVICE_ERROR,
      message ?? MESSAGE.SERVICE_ERROR,
      options ?? { status: 500 });
  }
}

export class ProviderError extends ApiError {
  constructor(message?: string|null, options?: ApiErrOptions) {
    super(
      ERROR.PROVIDER_ERROR,
      message ?? MESSAGE.PROVIDER_ERROR,
      options ?? { type: 'external_service_error', status: 502 }
    );
  }
}

export class AuthenticationError extends ApiError {
  constructor(message?: string|null, options?: ApiErrOptions) {
    super(
      ERROR.AUTHENTICATION_FAILED,
      message ?? MESSAGE.AUTHENTICATION_FAILED,
      options ?? { type: 'auth_error', status: 401 }
    );
  }
}

export class ProviderAuthenticationError extends ApiError {
  constructor(message?: string|null, options?: ApiErrOptions) {
    super(
      ERROR.AUTHENTICATION_FAILED,
      message ?? MESSAGE.PROVIDER_AUTHENTICATION_FAILED,
      options ?? { type: 'external_service_error', status: 401 }
    );
  }
}

export class SessionNotFoundError extends ApiError {
  constructor(message?: string|null, options?: ApiErrOptions) {
    super(
      ERROR.SESSION_NOT_FOUND,
      message ?? MESSAGE.SESSION_NOT_FOUND,
      options ?? { type: 'auth_error', status: 401 }
    );
  }
}

export class ResourceNotFoundError extends ApiError {
  constructor(message?: string|null, options?: ApiErrOptions) {
    super(
      ERROR.RESOURCE_NOT_FOUND,
      message ?? MESSAGE.RESOURCE_NOT_FOUND,
      options ?? { type: 'resource', status: 404 }
    );
  }
}

export class ResourceActionError extends ApiError {
  constructor(message?: string|null, options?: ApiErrOptions) {
    super(
      ERROR.RESOURCE_ACTION_ERROR,
      message ?? MESSAGE.RESOURCE_ACTION_ERROR,
      options ?? { type: 'resource', status: 500 }
    );
  }
}