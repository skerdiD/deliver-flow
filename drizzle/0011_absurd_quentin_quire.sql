CREATE TYPE "public"."notification_entity_type" AS ENUM('project_update', 'approval', 'feedback', 'project_file', 'payment');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('project_update_created', 'approval_requested', 'feedback_submitted', 'project_file_uploaded', 'payment_due', 'payment_overdue', 'approval_accepted', 'approval_changes_requested');--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"recipient_profile_id" uuid NOT NULL,
	"actor_profile_id" uuid,
	"project_id" uuid,
	"type" "notification_type" NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"entity_type" "notification_entity_type",
	"entity_id" uuid,
	"action_url" text,
	"dedupe_key" text,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "notifications_dedupe_key_unique" UNIQUE("dedupe_key")
);
--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_profile_id_profiles_id_fk" FOREIGN KEY ("recipient_profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_actor_profile_id_profiles_id_fk" FOREIGN KEY ("actor_profile_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notifications_recipient_created_at_idx" ON "notifications" USING btree ("recipient_profile_id","created_at");--> statement-breakpoint
CREATE INDEX "notifications_recipient_read_created_at_idx" ON "notifications" USING btree ("recipient_profile_id","read_at","created_at");--> statement-breakpoint
CREATE INDEX "notifications_workspace_created_at_idx" ON "notifications" USING btree ("workspace_id","created_at");--> statement-breakpoint
CREATE INDEX "notifications_project_created_at_idx" ON "notifications" USING btree ("project_id","created_at");