'use server';

import { getUserRepository } from "@/infra/db/user.repository";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

const log = logger.child({ action: 'editLink' });

const REGEX_ALIAS = /[^a-zA-Z0-9_\- /#]+/;

type LinkState = {
  slug: string;
  alias: string;
  success?: boolean;
}

export async function editLinkAction(initialState: LinkState, formData: FormData) {
  const alias = formData.get('alias') as string;
  const slug = initialState.slug;

  if(REGEX_ALIAS.test(alias) || !slug) {
    log.warn({ slug }, 'rejected alias: %s', alias);
    return { ...initialState, success: false };
  }

  const supabase = await createClient();
  const userRepo = getUserRepository(supabase);

  const { data: { user } } = await supabase.auth.getUser();
  if(!user) {
    log.info({ slug }, 'rejected alias change without session');
    return { ...initialState, success: false };
  }

  const { data: isOwner } = await userRepo.isOwner(user.id, slug);
  if(!isOwner) {
    log.warn({ slug, userId: user.id }, 'rejected alias change from non-owner');
    return { ...initialState, success: false };
  }
  const { error } = await userRepo.changeAlias(slug, alias);

  if(error) {
    log.error({ slug, error }, 'failed to change alias');
    return { ...initialState, success: false };
  }

  log.info({ slug }, 'alias updated');
  return { ...initialState, alias, success: true };
}
