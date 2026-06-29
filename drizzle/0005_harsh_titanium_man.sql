ALTER TYPE "public"."approval_status" ADD VALUE 'cancelled';--> statement-breakpoint
ALTER TYPE "public"."payment_status" ADD VALUE 'void';--> statement-breakpoint
ALTER TABLE "approvals" ADD COLUMN "cancel_reason" text;--> statement-breakpoint
ALTER TABLE "approvals" ADD COLUMN "cancelled_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "approvals" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "resolved_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "voided_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "void_reason" text;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "project_files" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "approvals_cancelled_at_idx" ON "approvals" USING btree ("cancelled_at");--> statement-breakpoint
CREATE INDEX "approvals_deleted_at_idx" ON "approvals" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "feedback_archived_at_idx" ON "feedback" USING btree ("archived_at");--> statement-breakpoint
CREATE INDEX "feedback_resolved_at_idx" ON "feedback" USING btree ("resolved_at");--> statement-breakpoint
CREATE INDEX "feedback_deleted_at_idx" ON "feedback" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "payments_voided_at_idx" ON "payments" USING btree ("voided_at");--> statement-breakpoint
CREATE INDEX "payments_deleted_at_idx" ON "payments" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "project_files_deleted_at_idx" ON "project_files" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "tasks_deleted_at_idx" ON "tasks" USING btree ("deleted_at");