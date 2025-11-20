CREATE TABLE IF NOT EXISTS "webhook_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"callback_url" text NOT NULL,
	"verify_token" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "webhook_configs_verify_token_unique" UNIQUE("verify_token")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "webhook_configs" ADD CONSTRAINT "webhook_configs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
