import fs from "node:fs";
import readline from "node:readline";
import { createClient } from '@supabase/supabase-js';
import { type Database } from "@/lib/types/db.types";
import { connect } from "@tursodatabase/serverless";

const args = process.argv.slice(2);

const isTurso = args[0] === '--turso';
const isSupabase = args[0] === '--supabase';

class DB {
  private static instance: DB;
  public supabase!: ReturnType<typeof createClient<Database>>;
  public turso!: ReturnType<typeof connect>;

  private constructor() {
    if (isSupabase) {
      const supabaseUrl = process.env.SUPABASE_URL!;
      const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLEKEY!;
      this.supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey);
    }

    if (isTurso) {
      this.turso = connect({
        url: process.env.TURSO_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN!,
      });
    }
  }

  public static getInstance(): DB {
    if (!DB.instance) {
      DB.instance = new DB();
    }

    return DB.instance;
  }
}

const supabase = DB.getInstance().supabase;
const turso = DB.getInstance().turso;

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

async function insert_domains_supabase(domains: string[]) {
  const { data, error } = await supabase
    .schema('security')
    .rpc('insert_blocked_url', { domains });

  if (error) {
    console.error("Error al subir URLs:", error);
  } else {
    console.log("URLs subidas exitosamente:", data);
  }
}

async function insert_domains_turso(domains: string[]) {
  const values: string[] = [];
  for (const domain of domains) {
    values.push(`('${domain}')`);
  }

  const query = `INSERT INTO blocked_domains (domain) VALUES ${values.join(',')} ON CONFLICT DO NOTHING`;
  await turso.exec(query);
}

async function upload_urls(insert_domains: (domains: string[]) => Promise<void>) {
  const urls = await get_urls();

  const total = urls.length;
  let uploadedCount = 0;
  let chunk: string[];
  while ((chunk = urls.splice(0, 200)).length > 0) {
    console.time(`[Status] upload: ${uploadedCount} / ${total} - left: ${urls.length}`);
    await insert_domains(chunk);
    console.timeEnd(`[Status] upload: ${uploadedCount} / ${total} - left: ${urls.length}`);
    uploadedCount += chunk.length;
    console.log(`Total de dominios subidos: ${uploadedCount}`);
  }
  console.log(`Subida completada: ${uploadedCount} / ${total} dominios subidos.`);
}

if (isSupabase) {
  upload_urls(insert_domains_supabase)
    .catch(console.error);
} else if (isTurso) {
  upload_urls(insert_domains_turso)
    .catch(console.error);
}

