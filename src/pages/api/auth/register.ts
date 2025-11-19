import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/utils/supabase/api";
import * as z from "zod/mini";

const zodEmail = z.email();

export default async function login(request: NextApiRequest, response: NextApiResponse) {
  return response.status(404).end();

  /*
  if(request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  const { name, email, password } = JSON.parse(request.body);

  const isValidEmail = zodEmail.safeParse(email).success;
  if(!isValidEmail || !name || !password) {
    return;
  }

  const supabase = createClient(request, response);
  const { error } = await supabase.auth.signUp({ email, password, options: {
      data: {
        name: name,
        display_name: name,
      }
    } });

  if (error) {
    console.error(error)
    return response.status(402).send({
      error: error.message,
    });
  }

  return response.status(200).json({});
   */
}