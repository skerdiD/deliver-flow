CREATE TYPE "public"."project_file_cleanup_status" AS ENUM('pending', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."project_file_scan_status" AS ENUM('pending', 'clean', 'infected', 'failed');--> statement-breakpoint
CREATE TABLE "project_file_cleanup_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"project_id" uuid,
	"file_id" uuid,
	"bucket_name" text NOT NULL,
	"storage_path" text NOT NULL,
	"reason" text NOT NULL,
	"status" "project_file_cleanup_status" DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"processed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "project_files" ADD COLUMN "original_file_name" text;--> statement-breakpoint
ALTER TABLE "project_files" ADD COLUMN "file_extension" text;--> statement-breakpoint
ALTER TABLE "project_files" ADD COLUMN "checksum_sha256" text;--> statement-breakpoint
ALTER TABLE "project_files" ADD COLUMN "scan_status" "project_file_scan_status" DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "project_files" ADD COLUMN "scan_completed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "project_files" ADD COLUMN "scan_failure_reason" text;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "storage_quota_bytes" bigint DEFAULT 1073741824 NOT NULL;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "storage_used_bytes" bigint DEFAULT 0 NOT NULL;--> statement-breakpoint
UPDATE "project_files"
SET
	"original_file_name" = COALESCE(NULLIF("file_name", ''), 'Legacy file'),
	"file_extension" = COALESCE(
		lower(substring(COALESCE(NULLIF("file_name", ''), "storage_path") from '\.[A-Za-z0-9]+$')),
		'.bin'
	),
	"scan_status" = COALESCE("scan_status", 'pending'::"public"."project_file_scan_status")
WHERE "original_file_name" IS NULL
   OR "file_extension" IS NULL
   OR "scan_status" IS NULL;--> statement-breakpoint
UPDATE "workspaces" w
SET "storage_used_bytes" = COALESCE((
	SELECT SUM(COALESCE(pf."file_size", 0))::bigint
	FROM "project_files" pf
	WHERE pf."workspace_id" = w."id"
	  AND pf."deleted_at" IS NULL
), 0);--> statement-breakpoint
ALTER TABLE "project_files" ALTER COLUMN "original_file_name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "project_files" ALTER COLUMN "file_extension" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "project_files" ALTER COLUMN "scan_status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "project_file_cleanup_jobs" ADD CONSTRAINT "project_file_cleanup_jobs_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_file_cleanup_jobs" ADD CONSTRAINT "project_file_cleanup_jobs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_file_cleanup_jobs" ADD CONSTRAINT "project_file_cleanup_jobs_file_id_project_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."project_files"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "project_file_cleanup_jobs_workspace_status_idx" ON "project_file_cleanup_jobs" USING btree ("workspace_id","status");--> statement-breakpoint
CREATE INDEX "project_file_cleanup_jobs_project_status_idx" ON "project_file_cleanup_jobs" USING btree ("project_id","status");--> statement-breakpoint
CREATE INDEX "project_file_cleanup_jobs_file_id_idx" ON "project_file_cleanup_jobs" USING btree ("file_id");--> statement-breakpoint
CREATE INDEX "project_files_scan_status_idx" ON "project_files" USING btree ("scan_status");--> statement-breakpoint
CREATE INDEX "project_files_workspace_scan_status_idx" ON "project_files" USING btree ("workspace_id","scan_status");--> statement-breakpoint
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_storage_quota_bytes_check" CHECK ("workspaces"."storage_quota_bytes" > 0);--> statement-breakpoint
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_storage_used_bytes_check" CHECK ("workspaces"."storage_used_bytes" >= 0);
