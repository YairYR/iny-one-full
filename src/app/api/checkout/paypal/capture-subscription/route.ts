import { NextRequest } from "next/server";
import * as z from "zod";
import { captureSubscription } from "@/core/use-cases/payment";
import { User } from "@supabase/auth-js";
import { createClient } from "@/lib/supabase/server";
import { withErrorHandling } from "@/lib/api/http";
import { SessionNotFoundError } from "@/lib/api/errors";
import { successResponse } from "@/lib/api/responses";

const SubscriptionBodyRequest = z.object({
  id: z.string(),
});

export const PATCH = withErrorHandling(async function PATCH(request: NextRequest) {
  const bodyNoValidated = await request.json();
  const { id } = SubscriptionBodyRequest.parse(bodyNoValidated);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if(!data.user || error) {
    throw new SessionNotFoundError()
  }

  const user: User = data.user;
  const subscriber = await captureSubscription(id, user);
  return successResponse(subscriber);
})