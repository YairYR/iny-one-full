import fs from "node:fs";
import readline from "node:readline";
import { createClient } from '@supabase/supabase-js';
import { type Database } from "@/lib/types/db.types";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLEKEY!;

const supabase_service = createClient<Database>(supabaseUrl, supabaseServiceRoleKey);

async function get_urls() {
  const filePath = "scripts/files/all.txt";

  const lines = [];
  const rl = readline.createInterface({
    input: fs.createReadStream(filePath),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    const domain = line.trim().toLowerCase();
    if (domain && domain !== '404: Not Found') lines.push(domain);
  }

  const total = lines.length;

  console.log("Dominios cargados:", total);

  return lines;
}

async function upload_urls() {
  async function insert_domains(domains: string[]) {
    const { data, error } = await supabase_service
      .schema('security')
      .rpc('insert_blocked_url', { domains });

    if (error) {
      console.error("Error al subir URLs:", error);
    } else {
      console.log("URLs subidas exitosamente:", data);
    }
  }

  const urls = await get_urls();

  let chunk: string[];
  while ((chunk = urls.splice(0, 2000)).length > 0) {
    await insert_domains(chunk);
  }
}

upload_urls()
  .catch(console.error);
