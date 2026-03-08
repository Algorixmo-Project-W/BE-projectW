ALTER TABLE "messages" ADD COLUMN "reply_content" text;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "reply_message_id" text;--> statement-breakpoint
ALTER TABLE "messages" DROP COLUMN IF EXISTS "direction";