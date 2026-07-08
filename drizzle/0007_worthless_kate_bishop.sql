CREATE TABLE "workspaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workspaces_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
INSERT INTO "workspaces" ("id", "name", "slug")
VALUES ('00000000-0000-4000-8000-000000000000', 'Legacy Workspace', 'legacy-workspace')
ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
ALTER TABLE "clients" DROP CONSTRAINT IF EXISTS "clients_email_unique";
--> statement-breakpoint
ALTER TABLE "admin_notes" ADD COLUMN "workspace_id" uuid;
--> statement-breakpoint
ALTER TABLE "approvals" ADD COLUMN "workspace_id" uuid;
--> statement-breakpoint
ALTER TABLE "client_invitations" ADD COLUMN "workspace_id" uuid;
--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "workspace_id" uuid;
--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "workspace_id" uuid;
--> statement-breakpoint
ALTER TABLE "milestones" ADD COLUMN "workspace_id" uuid;
--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "workspace_id" uuid;
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "workspace_id" uuid;
--> statement-breakpoint
ALTER TABLE "project_activity" ADD COLUMN "workspace_id" uuid;
--> statement-breakpoint
ALTER TABLE "project_assignments" ADD COLUMN "workspace_id" uuid;
--> statement-breakpoint
ALTER TABLE "project_files" ADD COLUMN "workspace_id" uuid;
--> statement-breakpoint
ALTER TABLE "project_updates" ADD COLUMN "workspace_id" uuid;
--> statement-breakpoint
ALTER TABLE "project_view_events" ADD COLUMN "workspace_id" uuid;
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "workspace_id" uuid;
--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "workspace_id" uuid;
--> statement-breakpoint
UPDATE "profiles"
SET "workspace_id" = '00000000-0000-4000-8000-000000000000'
WHERE "workspace_id" IS NULL;
--> statement-breakpoint
UPDATE "clients"
SET "workspace_id" = COALESCE(
	(
		SELECT "profiles"."workspace_id"
		FROM "profiles"
		WHERE "profiles"."id" = "clients"."created_by"
	),
	'00000000-0000-4000-8000-000000000000'
)
WHERE "workspace_id" IS NULL;
--> statement-breakpoint
UPDATE "projects"
SET "workspace_id" = COALESCE(
	(
		SELECT "profiles"."workspace_id"
		FROM "profiles"
		WHERE "profiles"."id" = "projects"."created_by"
	),
	'00000000-0000-4000-8000-000000000000'
)
WHERE "workspace_id" IS NULL;
--> statement-breakpoint
UPDATE "project_assignments"
SET "workspace_id" = COALESCE(
	(
		SELECT "projects"."workspace_id"
		FROM "projects"
		WHERE "projects"."id" = "project_assignments"."project_id"
	),
	(
		SELECT "clients"."workspace_id"
		FROM "clients"
		WHERE "clients"."id" = "project_assignments"."client_id"
	),
	'00000000-0000-4000-8000-000000000000'
)
WHERE "workspace_id" IS NULL;
--> statement-breakpoint
UPDATE "client_invitations"
SET "workspace_id" = COALESCE(
	(
		SELECT "clients"."workspace_id"
		FROM "clients"
		WHERE "clients"."id" = "client_invitations"."client_id"
	),
	(
		SELECT "profiles"."workspace_id"
		FROM "profiles"
		WHERE "profiles"."id" = "client_invitations"."invited_by"
	),
	'00000000-0000-4000-8000-000000000000'
)
WHERE "workspace_id" IS NULL;
--> statement-breakpoint
UPDATE "admin_notes"
SET "workspace_id" = COALESCE(
	(
		SELECT "profiles"."workspace_id"
		FROM "profiles"
		WHERE "profiles"."id" = "admin_notes"."created_by"
	),
	'00000000-0000-4000-8000-000000000000'
)
WHERE "workspace_id" IS NULL;
--> statement-breakpoint
UPDATE "milestones"
SET "workspace_id" = COALESCE(
	(SELECT "projects"."workspace_id" FROM "projects" WHERE "projects"."id" = "milestones"."project_id"),
	'00000000-0000-4000-8000-000000000000'
)
WHERE "workspace_id" IS NULL;
--> statement-breakpoint
UPDATE "tasks"
SET "workspace_id" = COALESCE(
	(SELECT "projects"."workspace_id" FROM "projects" WHERE "projects"."id" = "tasks"."project_id"),
	'00000000-0000-4000-8000-000000000000'
)
WHERE "workspace_id" IS NULL;
--> statement-breakpoint
UPDATE "project_updates"
SET "workspace_id" = COALESCE(
	(SELECT "projects"."workspace_id" FROM "projects" WHERE "projects"."id" = "project_updates"."project_id"),
	'00000000-0000-4000-8000-000000000000'
)
WHERE "workspace_id" IS NULL;
--> statement-breakpoint
UPDATE "feedback"
SET "workspace_id" = COALESCE(
	(SELECT "projects"."workspace_id" FROM "projects" WHERE "projects"."id" = "feedback"."project_id"),
	(SELECT "clients"."workspace_id" FROM "clients" WHERE "clients"."id" = "feedback"."client_id"),
	'00000000-0000-4000-8000-000000000000'
)
WHERE "workspace_id" IS NULL;
--> statement-breakpoint
UPDATE "approvals"
SET "workspace_id" = COALESCE(
	(SELECT "projects"."workspace_id" FROM "projects" WHERE "projects"."id" = "approvals"."project_id"),
	'00000000-0000-4000-8000-000000000000'
)
WHERE "workspace_id" IS NULL;
--> statement-breakpoint
UPDATE "payments"
SET "workspace_id" = COALESCE(
	(SELECT "projects"."workspace_id" FROM "projects" WHERE "projects"."id" = "payments"."project_id"),
	'00000000-0000-4000-8000-000000000000'
)
WHERE "workspace_id" IS NULL;
--> statement-breakpoint
UPDATE "project_files"
SET "workspace_id" = COALESCE(
	(SELECT "projects"."workspace_id" FROM "projects" WHERE "projects"."id" = "project_files"."project_id"),
	'00000000-0000-4000-8000-000000000000'
)
WHERE "workspace_id" IS NULL;
--> statement-breakpoint
UPDATE "project_activity"
SET "workspace_id" = COALESCE(
	(SELECT "projects"."workspace_id" FROM "projects" WHERE "projects"."id" = "project_activity"."project_id"),
	'00000000-0000-4000-8000-000000000000'
)
WHERE "workspace_id" IS NULL;
--> statement-breakpoint
UPDATE "project_view_events"
SET "workspace_id" = COALESCE(
	(SELECT "projects"."workspace_id" FROM "projects" WHERE "projects"."id" = "project_view_events"."project_id"),
	(SELECT "clients"."workspace_id" FROM "clients" WHERE "clients"."id" = "project_view_events"."client_id"),
	'00000000-0000-4000-8000-000000000000'
)
WHERE "workspace_id" IS NULL;
--> statement-breakpoint
ALTER TABLE "admin_notes" ALTER COLUMN "workspace_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "approvals" ALTER COLUMN "workspace_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "client_invitations" ALTER COLUMN "workspace_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "workspace_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "feedback" ALTER COLUMN "workspace_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "milestones" ALTER COLUMN "workspace_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "workspace_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "workspace_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "project_activity" ALTER COLUMN "workspace_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "project_assignments" ALTER COLUMN "workspace_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "project_files" ALTER COLUMN "workspace_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "project_updates" ALTER COLUMN "workspace_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "project_view_events" ALTER COLUMN "workspace_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "workspace_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "workspace_id" SET NOT NULL;
--> statement-breakpoint
CREATE INDEX "workspaces_slug_idx" ON "workspaces" USING btree ("slug");
--> statement-breakpoint
ALTER TABLE "admin_notes" ADD CONSTRAINT "admin_notes_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "client_invitations" ADD CONSTRAINT "client_invitations_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "project_activity" ADD CONSTRAINT "project_activity_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "project_assignments" ADD CONSTRAINT "project_assignments_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "project_files" ADD CONSTRAINT "project_files_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "project_updates" ADD CONSTRAINT "project_updates_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "project_view_events" ADD CONSTRAINT "project_view_events_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "approvals_workspace_id_idx" ON "approvals" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX "client_invitations_workspace_id_idx" ON "client_invitations" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX "clients_workspace_id_idx" ON "clients" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX "feedback_workspace_id_idx" ON "feedback" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX "milestones_workspace_id_idx" ON "milestones" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX "payments_workspace_id_idx" ON "payments" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX "project_activity_workspace_id_idx" ON "project_activity" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX "project_assignments_workspace_id_idx" ON "project_assignments" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX "project_files_workspace_id_idx" ON "project_files" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX "project_updates_workspace_id_idx" ON "project_updates" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX "project_view_events_workspace_id_idx" ON "project_view_events" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX "projects_workspace_id_idx" ON "projects" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX "tasks_workspace_id_idx" ON "tasks" USING btree ("workspace_id");
--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_workspace_email_unique" UNIQUE("workspace_id","email");
