/**
 * Logger estructurado sin dependencias.
 *
 * - En producción emite una línea JSON por evento, lista para ser indexada por
 *   Vercel Log Drains, Datadog o cualquier colector que parsee stdout.
 * - En desarrollo emite texto legible.
 * - Redacta claves sensibles (tokens, cookies, credenciales, PII) en cualquier
 *   nivel del contexto antes de serializar.
 *
 * Uso:
 *   import { logger } from '@/lib/logger';
 *   const log = logger.child({ route: 'api/shorten', requestId });
 *   log.warn('slug collision', { attempt: 2 });
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

export type LogContext = Record<string, unknown>;

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 100,
};

const CONSOLE_METHOD = {
  debug: 'debug',
  info: 'info',
  warn: 'warn',
  error: 'error',
} as const satisfies Record<Exclude<LogLevel, 'silent'>, keyof Console>;

/** Claves cuyo valor nunca debe llegar a los logs. */
const SENSITIVE_KEY =
  /^(?:password|pass|pwd|secret|client_secret|token|access_token|refresh_token|id_token|authorization|cookie|set-cookie|api_?key|session|credit_?card|ip|ip_user|email|email_address)$/i;

const REDACTED = '[redacted]';

/** Profundidad máxima al serializar para evitar ciclos y objetos gigantes. */
const MAX_DEPTH = 4;
const MAX_ARRAY_ITEMS = 20;
const MAX_STRING_LENGTH = 2_000;

function resolveLevel(): LogLevel {
  const configured = process.env.LOG_LEVEL?.toLowerCase();
  if (configured && configured in LEVEL_WEIGHT) {
    return configured as LogLevel;
  }
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
}

function serializeError(error: Error): LogContext {
  const serialized: LogContext = {
    name: error.name,
    message: error.message,
  };

  if (error.stack) serialized.stack = error.stack;
  if (error.cause !== undefined) serialized.cause = sanitize(error.cause, MAX_DEPTH - 1);

  // Errores de Supabase/PostgREST y ApiError exponen `code`; es lo más útil para
  // filtrar en el colector, así que se conserva siempre que exista.
  const code = (error as { code?: unknown }).code;
  if (typeof code === 'string' || typeof code === 'number') serialized.code = code;

  return serialized;
}

function sanitize(value: unknown, depth = MAX_DEPTH): unknown {
  if (value === null || value === undefined) return value;

  if (value instanceof Error) return serializeError(value);

  switch (typeof value) {
    case 'string':
      return value.length > MAX_STRING_LENGTH ? `${value.slice(0, MAX_STRING_LENGTH)}…` : value;
    case 'number':
      return Number.isFinite(value) ? value : String(value);
    case 'bigint':
      return value.toString();
    case 'boolean':
      return value;
    case 'function':
    case 'symbol':
      return undefined;
  }

  if (depth <= 0) return '[truncated]';

  if (Array.isArray(value)) {
    const items = value.slice(0, MAX_ARRAY_ITEMS).map((item) => sanitize(item, depth - 1));
    return value.length > MAX_ARRAY_ITEMS ? [...items, `… +${value.length - MAX_ARRAY_ITEMS}`] : items;
  }

  if (value instanceof Date) return value.toISOString();

  if (typeof value === 'object') {
    const output: LogContext = {};
    for (const [key, entry] of Object.entries(value as LogContext)) {
      output[key] = SENSITIVE_KEY.test(key) ? REDACTED : sanitize(entry, depth - 1);
    }
    return output;
  }

  return String(value);
}

class Logger {
  private readonly bindings: LogContext;

  constructor(bindings: LogContext = {}) {
    this.bindings = bindings;
  }

  /** Devuelve un logger que añade `bindings` a cada evento que emita. */
  child(bindings: LogContext): Logger {
    return new Logger({ ...this.bindings, ...bindings });
  }

  debug(message: string, context?: LogContext): void {
    this.emit('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.emit('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.emit('warn', message, context);
  }

  error(message: string, context?: LogContext): void {
    this.emit('error', message, context);
  }

  private emit(level: Exclude<LogLevel, 'silent'>, message: string, context?: LogContext): void {
    if (LEVEL_WEIGHT[level] < LEVEL_WEIGHT[resolveLevel()]) return;

    const payload = sanitize({ ...this.bindings, ...context }) as LogContext;
    const write = console[CONSOLE_METHOD[level]].bind(console);

    if (process.env.NODE_ENV === 'production') {
      write(JSON.stringify({ level, message, time: new Date().toISOString(), ...payload }));
      return;
    }

    const hasContext = Object.keys(payload).length > 0;
    if (hasContext) write(`[${level}] ${message}`, payload);
    else write(`[${level}] ${message}`);
  }
}

export const logger = new Logger();

export type { Logger };
