import 'server-only';
import pino from "pino";

const defaultOptions: pino.LoggerOptions = {
  level: process.env.LOG_LEVEL || "info",
  // Disable transport for Next.js
  transport: undefined,
  edgeLimit: 100,
} as const;

type ChildOptions = Pick<pino.LoggerOptions, 'redact'|'msgPrefix'|'name'>;

/**
 * Logger configuration using Pino.
 * The log level can be set using the LOG_LEVEL environment variable.
 * If not set, it defaults to "info".
 *
 * * Logger exclusively for **server-side** usage, as indicated by 'server-only'.
 * * Don't use in middleware or edge functions, as Pino is not compatible with those environments.
 */
export const logger = {
  child: (bindings: pino.Bindings, options?: ChildOptions) => pino({ ...defaultOptions, ...options, base: bindings })
};

export type Logger = pino.Logger;

export default logger;