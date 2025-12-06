import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { User } from "@supabase/auth-js";
import * as z from 'zod';
import { createSubscription } from "@/core/use-cases/payment";
import { withErrorHandling } from "@/lib/api/http";
import { ValidationError } from "@/lib/api/errors";
import { successResponse } from "@/lib/api/responses";

const SubscriptionBodyRequest = z.object({
  cart: z.object({
    id: z.string(),
    quantity: z.number(),
  }).array()
});

export const POST = withErrorHandling(async function POST(request: NextRequest){
  const bodyNoValidated = await request.json();
  const body = SubscriptionBodyRequest.parse(bodyNoValidated);
  if(! body.cart[0]) {
    throw new ValidationError();
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if(!data.user || error) {
    throw new ValidationError();
  }

  const user: User = data.user;
  const plan_id = body.cart[0].id;
  const paypalPlanId = await createSubscription(plan_id, user);
  return successResponse({ id: paypalPlanId });
})