import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { createProjectAction } from "@/features/admin/projects/actions";
import { ProjectForm } from "@/features/admin/projects/project-form";
import { getProjectClientOptions } from "@/features/admin/projects/projects-data";

export const metadata: Metadata = {
  title: "New Project",
};

export default async function NewProjectPage() {
  const clients = await getProjectClientOptions();

  return (
    <div className="space-y-6">
      <Button variant="outline" asChild>
        <Link href="/admin/projects">
          <ArrowLeft className="mr-2 size-4" />
          Back to projects
        </Link>
      </Button>

      <PageHeader
        eyebrow="New project"
        title="Create a delivery workspace"
        description="Set up the client, timeline, budget, and status details before adding tasks, milestones, files, and updates."
      />

      <ProjectForm
        mode="create"
        clients={clients}
        submitAction={createProjectAction}
      />
    </div>
  );
}
