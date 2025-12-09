'use server';

import { getUserRepository } from "@/infra/db/user.repository";
import { createClient } from "@/lib/supabase/server";

const REGEX_ALIAS = /[^a-zA-Z0-9_\- /#]+/;

export async function editLinkAction(formData: FormData) {
  const alias = formData.get('alias') as string;
  const slug = formData.get('slug') as string;

  if(REGEX_ALIAS.test(alias) || !slug) {
    throw new Error("Invalid alias format");
  }

  // Here you would typically call your database or API to update the link
  // For example:
  // await updateLinkInDatabase(slug, alias);

  const supabase = await createClient();
  const userRepo = getUserRepository(supabase);

  const { error } = await userRepo.changeAlias(slug, alias);

  if(error) {
    throw new Error(`Failed to update alias: ${error.message}`);
  }

  console.log(`Link with slug: ${slug} has been updated with new alias: ${alias}`);
}
