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
    log.info('rejected alias', { slug });
    return { ...initialState, success: false };
  }

  const supabase = await createClient();
  const userRepo = getUserRepository(supabase);

  const { data: { user } } = await supabase.auth.getUser();
  if(!user) {
    log.info('rejected alias change without session', { slug });
    return { ...initialState, success: false };
  }

  const { data: isOwner } = await userRepo.isOwner(user.id, slug);
  if(!isOwner) {
    log.warn('rejected alias change from non-owner', { slug, userId: user.id });
    return { ...initialState, success: false };
  }
  const { error } = await userRepo.changeAlias(slug, alias);

  if(error) {
    log.error('failed to change alias', { slug, error });
    return { ...initialState, success: false };
  }

  log.info('alias updated', { slug });
  return { ...initialState, alias, success: true };
}
