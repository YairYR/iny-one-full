import 'server-only';
import { Client, Environment, LogLevel, } from '@paypal/paypal-server-sdk';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'paypal' });

/**
 * Traduce `PAYPAL_API_ENVIRONMENT` al enum del SDK.
 *
 * El valor del enum es `"Production"`, con mayúscula. La comparación estricta
 * anterior mandaba a Sandbox cualquier otra grafía —`production`, `live`,
 * `PRODUCTION`— sin dejar rastro: se configuraba la cuenta real, se desplegaba,
 * y los usuarios firmaban suscripciones de juguete. El repo además ceba el
 * error, porque `VERCEL_ENV` vale `production` en minúscula.
 *
 * Ante un valor desconocido se elige Sandbox a propósito: equivocarse hacia el
 * entorno de pruebas no cobra dinero real, y el log lo hace evidente.
 */
export function resolvePaypalEnvironment(raw: string | undefined): Environment {
  const valor = raw?.trim().toLowerCase();

  if (valor === 'production' || valor === 'live') return Environment.Production;
  if (valor === 'sandbox' || valor === 'test') return Environment.Sandbox;

  if (valor) {
    log.error({ PAYPAL_API_ENVIRONMENT: raw },
      'unrecognised paypal environment, falling back to Sandbox: no real payment will be taken');
  } else {
    log.warn('PAYPAL_API_ENVIRONMENT is not set, using Sandbox');
  }

  return Environment.Sandbox;
}

const environment = resolvePaypalEnvironment(process.env.PAYPAL_API_ENVIRONMENT);

let client: Client | null = null;
export function getPayPalClient(): Client {
  if (!client) {
    log.info({ environment }, 'initialising paypal client');
  }

  client ??= new Client({
    environment: environment,
    clientCredentialsAuthCredentials: {
      oAuthClientId: process.env.PAYPAL_PUBLIC_API_CLIENT_ID!,
      oAuthClientSecret: process.env.PAYPAL_API_CLIENT_SECRET!,
    },
    logging: {
      logLevel: LogLevel.Info,
      logRequest: {
        logBody: true,
      },
      logResponse: {
        logHeaders: true,
      }
    },
    httpClientOptions: {
      /**
       * Reintentar POST contra una API de pagos sólo es seguro con clave de
       * idempotencia. `createSubscription` sí la manda (`paypalRequestId`), pero
       * esta configuración aplicaba a TODOS los POST del cliente —incluido
       * `cancelSubscription`, que no la lleva— y podía duplicar operaciones.
       *
       * Además `retryInterval` va en segundos: 30 × 2 reintentos son hasta 60 s
       * dentro de una función serverless, que agota el tiempo antes de reintentar.
       */
      retryConfig: {
        httpMethodsToRetry: ['GET'],
        retryInterval: 1,
        retryOnTimeout: true,
        maxNumberOfRetries: 2,
      }
    }
  });

  return client;
}
