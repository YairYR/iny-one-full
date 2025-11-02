import { createClient } from '@supabase/supabase-js';
import { Database } from "@/lib/types/db.types";

const supabaseUrl = process.env.NEXT_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey);

export default supabase;