import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { updateProjectAction } from "@/features/admin/projects/actions";
import { ProjectForm } from "@/features/admin/projects/project-form";
import {
  getAdminProjectById,
  getProjectClientOptions,
} from "@/features/admin/projects/projects-data";

export const metadata: Metadata = {
  title: "Edit Project",
};

type EditProjectPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { id } = await params;
  const project = await getAdminProjectById(id);
  const clients = await getProjectClientOptions();

  if (!project) {
    notFound();
  }

  const submitAction = updateProjectAction.bind(null, project.id);

  return (
    <div className="space-y-6">
      <Button variant="outline" asChild>
        <Link href={`/admin/projects/${project.id}`}>
          <ArrowLeft className="mr-2 size-4" />
          Back to project
        </Link>
      </Button>

      <PageHeader
        eyebrow="Edit project"
        title={`Update ${project.name}`}
        description="Change the project details used across the admin workspace and client portal."
      />

      <ProjectForm
        mode="edit"
        clients={clients}
        submitAction={submitAction}
        defaultValues={{
          name: project.name,
          clientId: project.client.id,
          description: project.description,
          status: project.status,
          progress: project.progress,
          deadline: project.deadline,
          liveDemoUrl: project.liveDemoUrl,
          repositoryUrl: project.repositoryUrl,
          paymentStatus:
            project.paymentStatus === "void" ? "unpaid" : project.paymentStatus,
          budgetDollars: project.budgetCents / 100,
          paidDollars: project.paidCents / 100,
        }}
      />
    </div>
  );
}
