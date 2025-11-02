import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";
import { captureSubscription } from "@/core/use-cases/payment";
import { User } from "@supabase/auth-js";

const SubscriptionBodyRequest = z.object({
  id: z.string(),
});

export async function PATCH(request: NextRequest) {
  try {
    const bodyNoValidated = await request.json();
    const { id } = SubscriptionBodyRequest.parse(bodyNoValidated);

    // const supabase = await createClient();
    // const { data, error } = await supabase.auth.getUser();
    // if(!data.user || error) {
    //   // TODO: check response status
    //   return NextResponse.json({}, { status: 401 });
    // }

    // TODO: user id for test
    // const user: User = data.user;
    const user = { id: '4fe166ec-0b6a-46fa-b067-48c527212eb5', email: 'baladaphilippe@gmail.com' } as unknown as User;

    const ok = await captureSubscription(id, user);
    return NextResponse.json({ ok });
  } catch(e) {
    if(e instanceof z.ZodError) {
      // ZOD PARSE ERROR
    }
    // TODO: ERROR
  }
}