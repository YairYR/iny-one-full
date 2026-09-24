import 'server-only';
import { connect, Connection } from '@tursodatabase/serverless';

let turso: Connection | null = null;
function createTursoClient(): Connection {
  if (!turso) {
    turso = connect({
      url: process.env.TURSO_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    });
  }

  return turso;
}

export async function isSafeDomain(domain: string) {
  const client = createTursoClient();
  const stmt = await client.prepare('SELECT 1 FROM blocked_domains WHERE domain = ? LIMIT 1');
  const result: {1: 1}|undefined = await stmt.get([domain]);
  return !result;
}