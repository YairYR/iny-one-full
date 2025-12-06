export const ERROR = {
  NOT_FOUND: "NOT_FOUND",
  RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",

  // === Errores de Validación (400–422) ===

  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_PAYLOAD: "INVALID_PAYLOAD",

  // === Errores de Autenticación (401) ===

  INVALID_TOKEN: "INVALID_TOKEN",
  EXPIRED_TOKEN: "EXPIRED_TOKEN",
  // Se requiere autenticación para acceder a este recurso.
  UNAUTHORIZED: "UNAUTHORIZED",
  // No existe una sesión activa.
  SESSION_NOT_FOUND: "SESSION_NOT_FOUND",
  // No fue posible autenticar al usuario.
  AUTHENTICATION_FAILED: "AUTHENTICATION_FAILED",

  // === Errores de Autorización (403) ===

  FORBIDDEN: "FORBIDDEN",
  INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",
  ROLE_NOT_ALLOWED: "ROLE_NOT_ALLOWED",

  // === Errores de Conflicto (409) ===

  RESOURCE_CONFLICT: "RESOURCE_CONFLICT",
  DUPLICATE_ENTRY: "DUPLICATE_ENTRY",

  // === Errores de Servidor (500–503) ===

  INTERNAL_ERROR: "INTERNAL_ERROR",
  SERVICE_ERROR: "SERVICE_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  PROVIDER_ERROR: "PROVIDER_ERROR",
  PAYMENT_PROVIDER_ERROR: "PAYMENT_PROVIDER_ERROR",

  // ===
  RESOURCE_ACTION_ERROR: "RESOURCE_ACTION_ERROR",
} as const;

export const MESSAGE = {
  NOT_FOUND: "Not found",
  RESOURCE_NOT_FOUND: "Resource not found",
  INTERNAL_ERROR: "Internal server error",
  INVALID_REQUEST: "Invalid request",
  SERVICE_ERROR: "Service error",
  INVALID_PAYLOAD: "The format of the application body is invalid",
  PROVIDER_ERROR: "The provider rejected the request",
  RESOURCE_ACTION_ERROR: "Resource action error",

  SESSION_NOT_FOUND: "Session not found",
  AUTHENTICATION_FAILED: "Incorrect email or password",
  PROVIDER_AUTHENTICATION_FAILED: "Provider authentication failed",
  PLAN_NOT_FOUND: "Plan not found",
  PAYPAL_PLAN_NOT_FOUND: "Paypal plan not found",
} as const;

