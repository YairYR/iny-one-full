import { NextApiRequest, NextApiResponse } from "next";
import isEmail from "validator/lib/isEmail";
import { createClient } from "@/utils/supabase/api";

export default async function login(request: NextApiRequest, response: NextApiResponse) {
  if(request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  const { email, password, provider } = JSON.parse(request.body);

  if(!provider) {
    if(! isEmail(email) || !password) {
      return;
    }
  }

  const supabase = createClient(request, response);

  // OAuth2.0
  if(provider) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: 'http://localhost:3000/auth/callback',
      }
    });

    if(data.url) {
      return response.status(200).json({
        data: {
          provider: data.provider,
          url: data.url,
        }
      });
    }

    return response.status(402).send({
      error: error,
      data
    });
  }

  // Email and password
  // ...

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error(error)
    return response.status(402).send({
      error: error,
    });
  }

  return response.status(200).json({});
}