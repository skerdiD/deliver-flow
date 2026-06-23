CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
	NEW.updated_at = now();
	RETURN NEW;
END;
$$;
--> statement-breakpoint
DROP TRIGGER IF EXISTS set_profiles_updated_at ON "profiles";--> statement-breakpoint
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON "profiles" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();--> statement-breakpoint
DROP TRIGGER IF EXISTS set_clients_updated_at ON "clients";--> statement-breakpoint
CREATE TRIGGER set_clients_updated_at BEFORE UPDATE ON "clients" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();--> statement-breakpoint
DROP TRIGGER IF EXISTS set_projects_updated_at ON "projects";--> statement-breakpoint
CREATE TRIGGER set_projects_updated_at BEFORE UPDATE ON "projects" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();--> statement-breakpoint
DROP TRIGGER IF EXISTS set_milestones_updated_at ON "milestones";--> statement-breakpoint
CREATE TRIGGER set_milestones_updated_at BEFORE UPDATE ON "milestones" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();--> statement-breakpoint
DROP TRIGGER IF EXISTS set_tasks_updated_at ON "tasks";--> statement-breakpoint
CREATE TRIGGER set_tasks_updated_at BEFORE UPDATE ON "tasks" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();--> statement-breakpoint
DROP TRIGGER IF EXISTS set_project_updates_updated_at ON "project_updates";--> statement-breakpoint
CREATE TRIGGER set_project_updates_updated_at BEFORE UPDATE ON "project_updates" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();--> statement-breakpoint
DROP TRIGGER IF EXISTS set_feedback_updated_at ON "feedback";--> statement-breakpoint
CREATE TRIGGER set_feedback_updated_at BEFORE UPDATE ON "feedback" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();--> statement-breakpoint
DROP TRIGGER IF EXISTS set_approvals_updated_at ON "approvals";--> statement-breakpoint
CREATE TRIGGER set_approvals_updated_at BEFORE UPDATE ON "approvals" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();--> statement-breakpoint
DROP TRIGGER IF EXISTS set_payments_updated_at ON "payments";--> statement-breakpoint
CREATE TRIGGER set_payments_updated_at BEFORE UPDATE ON "payments" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();--> statement-breakpoint
DROP TRIGGER IF EXISTS set_project_files_updated_at ON "project_files";--> statement-breakpoint
CREATE TRIGGER set_project_files_updated_at BEFORE UPDATE ON "project_files" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();--> statement-breakpoint
CREATE INDEX "approvals_project_status_requested_at_idx" ON "approvals" USING btree ("project_id","status","requested_at");--> statement-breakpoint
CREATE INDEX "approvals_status_requested_at_idx" ON "approvals" USING btree ("status","requested_at");--> statement-breakpoint
CREATE INDEX "clients_status_idx" ON "clients" USING btree ("status");--> statement-breakpoint
CREATE INDEX "clients_created_at_idx" ON "clients" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "feedback_project_client_created_at_idx" ON "feedback" USING btree ("project_id","client_id","created_at");--> statement-breakpoint
CREATE INDEX "feedback_status_created_at_idx" ON "feedback" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "milestones_project_visible_pos_idx" ON "milestones" USING btree ("project_id","is_visible_to_client","position");--> statement-breakpoint
CREATE INDEX "milestones_project_status_idx" ON "milestones" USING btree ("project_id","status");--> statement-breakpoint
CREATE INDEX "payments_project_status_due_date_idx" ON "payments" USING btree ("project_id","status","due_date");--> statement-breakpoint
CREATE INDEX "payments_status_due_date_idx" ON "payments" USING btree ("status","due_date");--> statement-breakpoint
CREATE INDEX "project_assignments_client_assigned_at_idx" ON "project_assignments" USING btree ("client_id","assigned_at");--> statement-breakpoint
CREATE INDEX "project_files_project_visible_created_at_idx" ON "project_files" USING btree ("project_id","is_visible_to_client","created_at");--> statement-breakpoint
CREATE INDEX "project_files_uploaded_by_idx" ON "project_files" USING btree ("uploaded_by");--> statement-breakpoint
CREATE INDEX "project_updates_project_visible_created_at_idx" ON "project_updates" USING btree ("project_id","is_visible_to_client","created_at");--> statement-breakpoint
CREATE INDEX "projects_status_idx" ON "projects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "projects_status_updated_at_idx" ON "projects" USING btree ("status","updated_at");--> statement-breakpoint
CREATE INDEX "tasks_project_status_idx" ON "tasks" USING btree ("project_id","status");--> statement-breakpoint
CREATE INDEX "tasks_project_visible_pos_idx" ON "tasks" USING btree ("project_id","is_visible_to_client","position");--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_amount_cents_check" CHECK ("payments"."amount_cents" > 0) NOT VALID;--> statement-breakpoint
ALTER TABLE "project_files" ADD CONSTRAINT "project_files_file_size_check" CHECK ("project_files"."file_size" IS NULL OR "project_files"."file_size" >= 0) NOT VALID;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_progress_check" CHECK ("projects"."progress" >= 0 AND "projects"."progress" <= 100) NOT VALID;
