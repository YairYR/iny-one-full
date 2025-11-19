import { createClient } from '@/utils/supabase/server';
import type { GetServerSidePropsContext } from "next";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  //const origin = context.req.headers["x-forwarded-host"] || context.req.headers.host;
  const searchParams = context.query;

  const code = searchParams['code'] as string
  // if "next" is in param, use it as the redirect URL
  let next = (searchParams['next'] as string) ?? ''
  if (!next.startsWith('/')) {
    // if "next" is not a relative URL, use the default
    next = '/dashboard';
  }

  console.log('next', next);

  if (code) {
    const supabase = createClient(context);
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return {
        redirect: {
          destination: next,
          permanent: false,
        }
      }
    }
  }

  return {
    redirect: {
      destination: '/auth/auth-code-error',
      permanent: false,
    }
  }
}

// No se renderiza porque siempre hacemos redirect, pero Next exige un default export
export default function _() { return null; }