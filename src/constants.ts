import 'server-only';

export const IS_PRODUCTION = process.env.VERCEL_ENV === 'production';
export const IS_DEVELOPMENT = process.env.VERCEL_ENV === 'development';

/* INACTIVO — sin importaciones ni referencias en el repositorio (rev. 2026-08-09).
 * No se elimina por si retoma uso en una build futura; hoy no tiene efecto en
 * producción. Al reactivarlo: descomentar y cubrirlo con tests.
 *
 * - ALLOWED_ORIGINS: se construyó para validar el origen de las peticiones,
 *   pero ninguna ruta lo consulta. Si se retoma, aplicarlo en /api/shorten.
 * - PAYPAL_CLIENT_ID: duplica lo que lib/paypal.ts lee directamente de
 *   process.env.PAYPAL_PUBLIC_API_CLIENT_ID.
 */
// export const ALLOWED_ORIGINS = ['https://iny.one', 'https://www.iny.one'];
//
// if (process.env.VERCEL_URL) ALLOWED_ORIGINS.push(`https://${process.env.VERCEL_URL}`);
// if (IS_DEVELOPMENT) ALLOWED_ORIGINS.push(`http://localhost:3000`);
//
// export const PAYPAL_CLIENT_ID = process.env.PAYPAL_PUBLIC_API_CLIENT_ID!;

export const CART_COOKIE_NAME = 'cart_items';
export const REDIRECT_TO_COOKIE_NAME = '_redirect_to';
