ALTER TABLE "ai_agents" ADD COLUMN "meeting_link" text;--> statement-breakpoint
ALTER TABLE "campaigns" DROP COLUMN IF EXISTS "openai_api_key";