export const IS_PRODUCTION: boolean = process.env.VERCEL_ENV === 'production';

export const ALLOWED_ORIGINS = ['https://iny.one', 'https://www.iny.one'];

if(process.env.VERCEL_URL) {
  ALLOWED_ORIGINS.push(`https://${process.env.VERCEL_URL}`);
}

if(!IS_PRODUCTION) {
  ALLOWED_ORIGINS.push(`http://localhost:3000`);
}
