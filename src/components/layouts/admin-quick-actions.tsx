"use client";

import {
  BadgeCheck,
  FolderPlus,
  Loader2,
  Plus,
  UploadCloud,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  requestProjectApprovalAction,
  uploadProjectFileAction,
  type ProjectActionResult,
} from "@/features/admin/projects/actions";

export type AdminQuickActionProject = {
  id: string;
  name: string;
  clientCompany: string;
  milestones: Array<{
    id: string;
    title: string;
  }>;
};

type AdminQuickActionsProps = {
  projects: AdminQuickActionProject[];
};

const initialUploadState: ProjectActionResult = {
  success: false,
  message: "",
};

export function AdminQuickActions({ projects }: AdminQuickActionsProps) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [approvalOpen, setApprovalOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Open quick actions"
            className="size-11 border-slate-200 bg-white/80 text-slate-700 hover:bg-slate-50 hover:text-slate-950"
          >
            <Plus className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 p-2">
          <DropdownMenuLabel className="px-2 py-1.5">
            Quick actions
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className="gap-3 px-2.5 py-2.5">
            <Link href="/admin/clients/new">
              <UserPlus className="size-4 text-slate-500" />
              <span>New Client</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="gap-3 px-2.5 py-2.5">
            <Link href="/admin/projects/new">
              <FolderPlus className="size-4 text-slate-500" />
              <span>New Project</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="gap-3 px-2.5 py-2.5"
            onSelect={() => setUploadOpen(true)}
          >
            <UploadCloud className="size-4 text-slate-500" />
            <span>Upload Deliverable</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-3 px-2.5 py-2.5"
            onSelect={() => setApprovalOpen(true)}
          >
            <BadgeCheck className="size-4 text-slate-500" />
            <span>Request Approval</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UploadDeliverableDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        projects={projects}
      />
      <RequestApprovalDialog
        open={approvalOpen}
        onOpenChange={setApprovalOpen}
        projects={projects}
      />
    </>
  );
}

function UploadDeliverableDialog({
  open,
  onOpenChange,
  projects,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: AdminQuickActionProject[];
}) {
  const router = useRouter();
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [uploadState, uploadAction, isUploading] = useActionState(
    uploadProjectFileAction,
    initialUploadState,
  );

  useEffect(() => {
    if (uploadState.success) {
      router.refresh();
    }
  }, [router, uploadState.success]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload deliverable</DialogTitle>
          <DialogDescription>
            Attach a finished file to a project so it appears in project files.
          </DialogDescription>
        </DialogHeader>

        <form action={uploadAction} className="space-y-4">
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="category" value="deliverable" />
          <input type="hidden" name="isVisibleToClient" value="on" />

          <div className="space-y-2">
            <Label>Project</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name} - {project.clientCompany}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quick-upload-label">Label</Label>
            <Input
              id="quick-upload-label"
              name="label"
              placeholder="Final dashboard handoff"
              disabled={isUploading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quick-upload-file">File</Label>
            <Input
              id="quick-upload-file"
              name="file"
              type="file"
              disabled={isUploading || projects.length === 0}
            />
          </div>

          <ActionMessage result={uploadState} />

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading || !projectId}>
              {isUploading ? <Loader2 className="size-4 animate-spin" /> : null}
              Upload file
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RequestApprovalDialog({
  open,
  onOpenChange,
  projects,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: AdminQuickActionProject[];
}) {
  const router = useRouter();
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [milestoneId, setMilestoneId] = useState("none");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<ProjectActionResult>(initialUploadState);
  const [isPending, startTransition] = useTransition();
  const selectedProject = useMemo(
    () => projects.find((project) => project.id === projectId),
    [projectId, projects],
  );

  function submitApprovalRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      const response = await requestProjectApprovalAction(projectId, {
        title,
        description,
        milestoneId: milestoneId === "none" ? undefined : milestoneId,
      });

      setResult(response);

      if (response.success) {
        setTitle("");
        setDescription("");
        setMilestoneId("none");
        router.refresh();
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Request approval</DialogTitle>
          <DialogDescription>
            Send a clear review request to the assigned client.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submitApprovalRequest} className="space-y-4">
          <div className="space-y-2">
            <Label>Project</Label>
            <Select
              value={projectId}
              onValueChange={(value) => {
                setProjectId(value);
                setMilestoneId("none");
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name} - {project.clientCompany}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Milestone</Label>
            <Select value={milestoneId} onValueChange={setMilestoneId}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">General approval</SelectItem>
                {selectedProject?.milestones.map((milestone) => (
                  <SelectItem key={milestone.id} value={milestone.id}>
                    {milestone.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quick-approval-title">Approval title</Label>
            <Input
              id="quick-approval-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Final deliverable review"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quick-approval-message">Message</Label>
            <Textarea
              id="quick-approval-message"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Please review the latest deliverable and approve it or request changes."
              className="min-h-28"
              disabled={isPending}
            />
          </div>

          <ActionMessage result={result} />

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !projectId}>
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Request approval
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ActionMessage({ result }: { result: ProjectActionResult }) {
  if (!result.message) {
    return null;
  }

  return (
    <p
      className={
        result.success
          ? "rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
          : "rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
      }
    >
      {result.message}
    </p>
  );
}
