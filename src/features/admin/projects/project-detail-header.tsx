import { ExternalLink, GitBranch } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import type { AdminProject } from "@/features/admin/projects/types";

type ProjectDetailHeaderProps = {
  project: AdminProject;
};

export function ProjectDetailHeader({ project }: ProjectDetailHeaderProps) {
  return (
    <PageHeader
      eyebrow="Project workspace"
      title={project.name}
      description={project.description}
    >
      {project.liveDemoUrl ? (
        <Button asChild>
          <a href={project.liveDemoUrl} target="_blank" rel="noreferrer">
            <ExternalLink className="size-4" />
            View demo
          </a>
        </Button>
      ) : null}

      {project.repositoryUrl ? (
        <Button asChild variant="outline">
          <a href={project.repositoryUrl} target="_blank" rel="noreferrer">
            <GitBranch className="size-4" />
            Repository
          </a>
        </Button>
      ) : null}

      <Button variant="outline" asChild>
        <Link href={`/admin/projects/${project.id}/edit`}>Edit project</Link>
      </Button>
    </PageHeader>
  );
}
