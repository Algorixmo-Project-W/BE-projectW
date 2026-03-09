// Run migration directly using drizzle
import { db } from './db/index.js';
import { sql } from 'drizzle-orm';

async function migrate() {
  console.log('Running migration for image reply support...');
  
  try {
    // Add reply_type column if not exists
    await db.execute(sql`ALTER TABLE "campaigns" ADD COLUMN IF NOT EXISTS "reply_type" text DEFAULT 'text' NOT NULL`);
    console.log('✅ Added reply_type column');
    
    // Add reply_image_url column if not exists
    await db.execute(sql`ALTER TABLE "campaigns" ADD COLUMN IF NOT EXISTS "reply_image_url" text`);
    console.log('✅ Added reply_image_url column');
    
    console.log('✅ Migration complete!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
  
  process.exit(0);
}

migrate();
