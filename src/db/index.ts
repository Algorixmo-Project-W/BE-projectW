import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';
import dotenv from 'dotenv';

dotenv.config();

// Prefer Supabase/Postgres URL, fallback to individual DB variables
const connectionString = process.env.DATABASE_URL ?? (() => {
  const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`DATABASE_URL is not defined and ${envVar} is missing in environment variables`);
    }
  }

  return `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
})();

// Create postgres client
const client = postgres(connectionString);

// Create drizzle instance
export const db = drizzle(client, { schema });

// Export schema for use in queries
export { schema };
