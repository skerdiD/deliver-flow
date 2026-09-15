-- Preserve every file row and Storage object. Legacy rows explicitly marked
-- infected remain unavailable after the legacy state is removed; other legacy
-- states become accessible through the normal authorization/visibility model.
UPDATE "project_files"
SET "deleted_at" = COALESCE("deleted_at", now()),
    "updated_at" = now()
WHERE "scan_status" = 'infected';--> statement-breakpoint
UPDATE "project_file_cleanup_jobs"
SET "reason" = 'legacy_blocked_file',
    "updated_at" = now()
WHERE "reason" = 'infected_file';--> statement-breakpoint
DROP INDEX "project_files_scan_status_idx";--> statement-breakpoint
DROP INDEX "project_files_workspace_scan_status_idx";--> statement-breakpoint
ALTER TABLE "project_files" DROP COLUMN "scan_status";--> statement-breakpoint
ALTER TABLE "project_files" DROP COLUMN "scan_completed_at";--> statement-breakpoint
ALTER TABLE "project_files" DROP COLUMN "scan_failure_reason";--> statement-breakpoint
DROP TYPE "public"."project_file_scan_status";
