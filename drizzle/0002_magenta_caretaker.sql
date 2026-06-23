CREATE TYPE "public"."client_invitation_status" AS ENUM('pending', 'accepted', 'expired');--> statement-breakpoint
CREATE TABLE "client_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"client_id" uuid,
	"token_hash" text NOT NULL,
	"status" "client_invitation_status" DEFAULT 'pending' NOT NULL,
	"invited_by" uuid,
	"accepted_by" uuid,
	"expires_at" timestamp with time zone NOT NULL,
	"accepted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "client_invitations_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
ALTER TABLE "client_invitations" ADD CONSTRAINT "client_invitations_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_invitations" ADD CONSTRAINT "client_invitations_invited_by_profiles_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_invitations" ADD CONSTRAINT "client_invitations_accepted_by_profiles_id_fk" FOREIGN KEY ("accepted_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "client_invitations_email_status_idx" ON "client_invitations" USING btree ("email","status");--> statement-breakpoint
CREATE INDEX "client_invitations_client_id_idx" ON "client_invitations" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "client_invitations_status_expires_at_idx" ON "client_invitations" USING btree ("status","expires_at");--> statement-breakpoint
DROP TRIGGER IF EXISTS set_client_invitations_updated_at ON "client_invitations";--> statement-breakpoint
CREATE TRIGGER set_client_invitations_updated_at BEFORE UPDATE ON "client_invitations" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
