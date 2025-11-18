export const IS_PRODUCTION = process.env.VERCEL_ENV === 'production';
export const IS_DEVELOPMENT = process.env.VERCEL_ENV === 'development';

export const ALLOWED_ORIGINS = ['https://iny.one', 'https://www.iny.one'];

if(process.env.VERCEL_URL) ALLOWED_ORIGINS.push(`https://${process.env.VERCEL_URL}`);
if(IS_DEVELOPMENT) ALLOWED_ORIGINS.push(`http://localhost:3000`);

export const PAYPAL_CLIENT_ID = process.env.PAYPAL_PUBLIC_API_CLIENT_ID!;

