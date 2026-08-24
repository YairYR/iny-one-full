/**
 * @jest-environment node
 */
import { isTrustedCertUrl } from '@/app/api/webhooks/utils';

describe('isTrustedCertUrl', () => {
  /**
   * Regresión de la falsificación de webhooks: `verifySignature` descargaba el
   * certificado del host que indicara la cabecera `paypal-cert-url` de la propia
   * petición entrante. Un atacante podía firmar con su clave, alojar su
   * certificado y hacer que la verificación pasara. Era falsificación y SSRF.
   */
  it.each([
    'https://api.paypal.com/v1/notifications/certs/CERT-abc',
    'https://api.sandbox.paypal.com/v1/notifications/certs/CERT-abc',
    'https://www.paypal.com/cert.pem',
  ])('acepta %p', (url) => {
    expect(isTrustedCertUrl(url)).toBe(true);
  });

  it.each([
    // El caso que abría el agujero.
    'https://atacante.com/cert.pem',
    // Sufijo que engaña a un `includes`, que es el error clásico al arreglarlo.
    'https://paypal.com.atacante.net/cert.pem',
    'https://notpaypal.com/cert.pem',
    // Sin TLS no hay nada que garantice el origen.
    'http://api.paypal.com/cert.pem',
    // SSRF hacia la red interna.
    'http://169.254.169.254/latest/meta-data/',
    'file:///etc/passwd',
    'no-es-una-url',
    '',
  ])('rechaza %p', (url) => {
    expect(isTrustedCertUrl(url)).toBe(false);
  });
});
