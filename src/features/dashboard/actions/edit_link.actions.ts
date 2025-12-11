'use server';

import { getUserRepository } from "@/infra/db/user.repository";
import { createClient } from "@/lib/supabase/server";

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
    console.log("Invalid alias format");
    return { ...initialState, success: false };
  }

  const supabase = await createClient();
  const userRepo = getUserRepository(supabase);

  const { data: { user } } = await supabase.auth.getUser();
  if(!user) {
    console.log("No session found");
    return { ...initialState, success: false };
  }

  const { data: isOwner } = await userRepo.isOwner(user.id, slug);
  if(!isOwner) {
    console.log("No owner found for slug");
    return { ...initialState, success: false };
  }
  const { error } = await userRepo.changeAlias(slug, alias);

  if(error) {
    console.log(error);
    return { ...initialState, success: false };
  }

  console.log(`Link with slug: ${slug} has been updated with new alias: ${alias}`);
  return { ...initialState, alias, success: true };
}
