import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL ?? (() => {
  const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`DATABASE_URL is not defined and ${envVar} is missing in environment variables`);
    }
  }

  return `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
})();

export default defineConfig({
  schema: './src/db/schema/*.schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: connectionString,
  },
  verbose: true,
  strict: true,
});
