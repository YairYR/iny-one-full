import 'server-only';
import {
  Client,
  Environment,
  LogLevel,
} from '@paypal/paypal-server-sdk';

const environment = (process.env.PAYPAL_API_ENVIRONMENT === Environment.Production)
  ? Environment.Production
  : Environment.Sandbox;

let client: Client | null = null;
export function getPayPalClient(): Client {
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
