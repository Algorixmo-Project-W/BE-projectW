ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "reply_content" text;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "reply_message_id" text;--> statement-breakpoint
ALTER TABLE "messages" DROP COLUMN IF EXISTS "direction";