ALTER TABLE "contacts" ALTER COLUMN "phone_number" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "web_sessions" ADD COLUMN "contact_id" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "web_sessions" ADD CONSTRAINT "web_sessions_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
