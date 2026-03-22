CREATE TABLE IF NOT EXISTS "ai_integrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ai_agent_id" uuid NOT NULL,
	"zoom" text,
	"hubspot" text,
	"google" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ai_integrations_ai_agent_id_unique" UNIQUE("ai_agent_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ai_integrations" ADD CONSTRAINT "ai_integrations_ai_agent_id_ai_agents_id_fk" FOREIGN KEY ("ai_agent_id") REFERENCES "public"."ai_agents"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "ai_agents" DROP COLUMN IF EXISTS "meeting_link";