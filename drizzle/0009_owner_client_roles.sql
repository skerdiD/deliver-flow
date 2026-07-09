UPDATE "profiles"
SET "role" = 'owner'
WHERE "role"::text IN ('admin', 'manager', 'staff');
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'project_activity_actor_role'
      AND e.enumlabel = 'owner'
  ) THEN
    IF EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
        AND t.typname = 'project_activity_actor_role'
        AND e.enumlabel = 'admin'
    ) THEN
      ALTER TYPE "public"."project_activity_actor_role" ADD VALUE 'owner' BEFORE 'admin';
    ELSE
      ALTER TYPE "public"."project_activity_actor_role" ADD VALUE 'owner' BEFORE 'client';
    END IF;
  END IF;
END;
$$;
--> statement-breakpoint
UPDATE "project_activity"
SET "actor_role" = 'owner'
WHERE "actor_role"::text = 'admin';
--> statement-breakpoint
ALTER TYPE "public"."app_role" RENAME TO "app_role_old";
--> statement-breakpoint
CREATE TYPE "public"."app_role" AS ENUM('owner', 'client');
--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "role" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "role" TYPE "public"."app_role" USING "role"::text::"public"."app_role";
--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "role" SET DEFAULT 'client';
--> statement-breakpoint
DROP TYPE "public"."app_role_old";
--> statement-breakpoint
ALTER TYPE "public"."project_activity_actor_role" RENAME TO "project_activity_actor_role_old";
--> statement-breakpoint
CREATE TYPE "public"."project_activity_actor_role" AS ENUM('owner', 'client', 'system');
--> statement-breakpoint
ALTER TABLE "project_activity" ALTER COLUMN "actor_role" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "project_activity" ALTER COLUMN "actor_role" TYPE "public"."project_activity_actor_role" USING "actor_role"::text::"public"."project_activity_actor_role";
--> statement-breakpoint
ALTER TABLE "project_activity" ALTER COLUMN "actor_role" SET DEFAULT 'system';
--> statement-breakpoint
DROP TYPE "public"."project_activity_actor_role_old";
