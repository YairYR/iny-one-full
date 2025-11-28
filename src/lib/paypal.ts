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
    }
  });

  return client;
}
