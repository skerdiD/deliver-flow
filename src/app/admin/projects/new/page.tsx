import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { getAdminProjects } from "@/features/admin/projects/projects-data";
import { ProjectsTable } from "@/features/admin/projects/projects-table";

export const metadata: Metadata = {
  title: "Projects",
};

export default async function AdminProjectsPage() {
  const projects = await getAdminProjects();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Projects"
        title="Manage delivery work"
        description="Create projects, assign clients, track progress, and keep delivery decisions in one place."
      >
        <Button asChild>
          <Link href="/admin/projects/new">
            <Plus className="mr-2 size-4" />
            New project
          </Link>
        </Button>
      </PageHeader>

      <ProjectsTable projects={projects} />
    </div>
  );
}