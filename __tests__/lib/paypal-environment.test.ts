/**
 * @jest-environment node
 */
import { Environment } from '@paypal/paypal-server-sdk';
import { resolvePaypalEnvironment } from '@/lib/paypal';

/**
 * El enum del SDK vale `"Production"`, con mayúscula. La comparación estricta
 * que había antes mandaba a Sandbox cualquier otra grafía sin dejar rastro, que
 * es la forma más cara de fallar: cuenta real configurada, despliegue hecho, y
 * ni un peso cobrado.
 */
describe('resolvePaypalEnvironment', () => {
  it.each(['Production', 'production', 'PRODUCTION', '  Production  ', 'live'])(
    'reconoce %p como producción',
    (valor) => {
      expect(resolvePaypalEnvironment(valor)).toBe(Environment.Production);
    },
  );

  it.each(['Sandbox', 'sandbox', 'test'])('reconoce %p como sandbox', (valor) => {
    expect(resolvePaypalEnvironment(valor)).toBe(Environment.Sandbox);
  });

  /** Equivocarse hacia sandbox no cobra dinero real; al revés sí. */
  it.each([undefined, '', 'prod', 'produccion', 'Live!', 'true'])(
    'cae a sandbox ante %p',
    (valor) => {
      expect(resolvePaypalEnvironment(valor)).toBe(Environment.Sandbox);
    },
  );
});
