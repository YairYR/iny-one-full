import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { type Database } from "@/lib/types/db.types";

const supabaseUrl = process.env.NEXT_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!;

export const supabase_service = createClient<Database>(supabaseUrl, supabaseServiceRoleKey);

export type DbInstance = SupabaseClient<Database>;
