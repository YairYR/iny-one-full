import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/app-server";
import { User } from "@supabase/auth-js";
import * as z from 'zod';
import { createSubscription } from "@/core/use-cases/payment";

const SubscriptionBodyRequest = z.object({
  cart: z.object({
    id: z.string(),
    quantity: z.number(),
  }).array()
});

export async function POST(request: NextRequest) {
  try {
    const bodyNoValidated = await request.json();
    const body = SubscriptionBodyRequest.parse(bodyNoValidated);
    if(! body.cart[0]) {
      // TODO: check response status
      return NextResponse.json({}, { status: 401 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if(!data.user || error) {
      // TODO: check response status
      return NextResponse.json({}, { status: 401 });
    }

    const user: User = data.user;
    const plan_id = body.cart[0].id;
    const paypalPlanId = await createSubscription(plan_id, user);
    return NextResponse.json({
      id: paypalPlanId,
    });
  } catch (e) {
    if(e instanceof z.ZodError) {
      // ZOD PARSE ERROR
    }
    // TODO: ERROR
  }
}