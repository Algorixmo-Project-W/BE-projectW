import { db } from './db/index.js';
import { sql } from 'drizzle-orm';

async function main() {
  const rows = await db.execute(sql`SELECT hash, created_at FROM __drizzle_migrations ORDER BY created_at`);
  console.log(JSON.stringify(rows, null, 2));
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
