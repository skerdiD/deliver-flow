CREATE TYPE "public"."project_activity_actor_role" AS ENUM('admin', 'client', 'system');--> statement-breakpoint
CREATE TYPE "public"."project_view_target_type" AS ENUM('project', 'update', 'file', 'approval', 'payment');--> statement-breakpoint
CREATE TABLE "project_activity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"actor_id" uuid,
	"actor_name" text,
	"actor_role" "project_activity_actor_role" DEFAULT 'system' NOT NULL,
	"type" text NOT NULL,
	"message" text NOT NULL,
	"metadata" json,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_view_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"user_id" uuid,
	"target_type" "project_view_target_type" NOT NULL,
	"target_id" uuid,
	"viewed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_view_events_client_target_unique" UNIQUE("project_id","client_id","target_type","target_id")
);
--> statement-breakpoint
ALTER TABLE "project_activity" ADD CONSTRAINT "project_activity_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_activity" ADD CONSTRAINT "project_activity_actor_id_profiles_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_view_events" ADD CONSTRAINT "project_view_events_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_view_events" ADD CONSTRAINT "project_view_events_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_view_events" ADD CONSTRAINT "project_view_events_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "project_activity_project_created_at_idx" ON "project_activity" USING btree ("project_id","created_at");--> statement-breakpoint
CREATE INDEX "project_activity_actor_id_idx" ON "project_activity" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "project_activity_type_idx" ON "project_activity" USING btree ("type");--> statement-breakpoint
CREATE INDEX "project_view_events_project_viewed_at_idx" ON "project_view_events" USING btree ("project_id","viewed_at");--> statement-breakpoint
CREATE INDEX "project_view_events_client_viewed_at_idx" ON "project_view_events" USING btree ("client_id","viewed_at");--> statement-breakpoint
CREATE INDEX "project_view_events_target_idx" ON "project_view_events" USING btree ("target_type","target_id");