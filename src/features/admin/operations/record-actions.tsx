"use client";

import {
  Archive,
  CheckCircle2,
  Download,
  Edit3,
  Loader2,
  MoreHorizontal,
  RotateCcw,
  Trash2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  approveApprovalAction,
  archiveFeedbackAction,
  cancelApprovalAction,
  deleteApprovalAction,
  deleteFeedbackAction,
  deleteFileAction,
  deletePaymentAction,
  deleteTaskAction,
  markAdminTaskCompleteAction,
  rejectApprovalAction,
  renameFileAction,
  resolveFeedbackAction,
  updateTaskAction,
  voidPaymentAction,
  type AdminOperationActionResult,
} from "@/features/admin/operations/actions";
import { updateProjectPaymentStatusAction } from "@/features/admin/projects/actions";
import type { AdminPaymentStatus } from "@/features/admin/projects/types";

type DialogKind =
  | "task-edit"
  | "task-delete"
  | "file-rename"
  | "file-delete"
  | "payment-void"
  | "payment-delete"
  | "feedback-archive"
  | "feedback-delete"
  | "approval-cancel"
  | "approval-delete"
  | null;

function useActionRunner() {
  const router = useRouter();
  const [result, setResult] = useState<AdminOperationActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function run(action: () => Promise<AdminOperationActionResult>, onSuccess?: () => void) {
    setResult(null);
    startTransition(async () => {
      const actionResult = await action();
      setResult(actionResult);

      if (actionResult.success) {
        onSuccess?.();
        router.refresh();
      }
    });
  }

  return { result, setResult, isPending, run };
}

function ResultMessage({
  result,
}: {
  result: AdminOperationActionResult | null;
}) {
  if (!result || result.success) {
    return null;
  }

  return <p className="text-sm text-red-600">{result.message}</p>;
}

export function TaskRecordActions(props: {
  taskId: string;
  projectId: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  status: string;
}) {
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [title, setTitle] = useState(props.title);
  const [description, setDescription] = useState(props.description ?? "");
  const [dueDate, setDueDate] = useState(props.dueDate ?? "");
  const { result, setResult, isPending, run } = useActionRunner();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon-sm" aria-label="Task actions">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              setResult(null);
              setDialog("task-edit");
            }}
          >
            <Edit3 className="size-4" />
            Edit
          </DropdownMenuItem>
          {props.status !== "completed" ? (
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                run(() =>
                  markAdminTaskCompleteAction({
                    taskId: props.taskId,
                    projectId: props.projectId,
                  }),
                );
              }}
            >
              <CheckCircle2 className="size-4" />
              Mark complete
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={(event) => {
              event.preventDefault();
              setResult(null);
              setDialog("task-delete");
            }}
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialog === "task-edit"} onOpenChange={(open) => setDialog(open ? "task-edit" : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit task</DialogTitle>
            <DialogDescription>Update the task details shown in the admin workspace.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input value={title} onChange={(event) => setTitle(event.target.value)} />
            <Textarea value={description} onChange={(event) => setDescription(event.target.value)} />
            <Input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
          </div>
          <ResultMessage result={result} />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isPending}>Cancel</Button>
            </DialogClose>
            <Button
              disabled={isPending}
              onClick={() =>
                run(
                  () =>
                    updateTaskAction({
                      taskId: props.taskId,
                      title,
                      description,
                      dueDate,
                    }),
                  () => setDialog(null),
                )
              }
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Save task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SimpleConfirmDialog
        open={dialog === "task-delete"}
        onOpenChange={(open) => setDialog(open ? "task-delete" : null)}
        title="Delete task?"
        description="This hides the task from project and client task lists."
        actionLabel="Delete task"
        destructive
        isPending={isPending}
        result={result}
        onConfirm={() =>
          run(() => deleteTaskAction({ taskId: props.taskId }), () =>
            setDialog(null),
          )
        }
      />
    </>
  );
}

export function FileRecordActions(props: {
  fileId: string;
  fileName: string;
}) {
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [fileName, setFileName] = useState(props.fileName);
  const { result, setResult, isPending, run } = useActionRunner();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon-sm" aria-label="File actions">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem asChild>
            <Link href={`/api/admin/files/${props.fileId}/download`}>
              <Download className="size-4" />
              Download
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              setResult(null);
              setDialog("file-rename");
            }}
          >
            <Edit3 className="size-4" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={(event) => {
              event.preventDefault();
              setResult(null);
              setDialog("file-delete");
            }}
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialog === "file-rename"} onOpenChange={(open) => setDialog(open ? "file-rename" : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename file</DialogTitle>
            <DialogDescription>Change the display name without moving the storage object.</DialogDescription>
          </DialogHeader>
          <Input value={fileName} onChange={(event) => setFileName(event.target.value)} />
          <ResultMessage result={result} />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isPending}>Cancel</Button>
            </DialogClose>
            <Button
              disabled={isPending}
              onClick={() =>
                run(
                  () => renameFileAction({ fileId: props.fileId, fileName }),
                  () => setDialog(null),
                )
              }
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Save name
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SimpleConfirmDialog
        open={dialog === "file-delete"}
        onOpenChange={(open) => setDialog(open ? "file-delete" : null)}
        title="Delete file?"
        description="This removes the storage object when possible, then hides the file record."
        actionLabel="Delete file"
        destructive
        isPending={isPending}
        result={result}
        onConfirm={() =>
          run(() => deleteFileAction({ fileId: props.fileId }), () =>
            setDialog(null),
          )
        }
      />
    </>
  );
}

export function PaymentRecordActions(props: {
  paymentId: string;
  projectId: string;
  status: AdminPaymentStatus;
}) {
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [confirmText, setConfirmText] = useState("");
  const [reason, setReason] = useState("");
  const { result, setResult, isPending, run } = useActionRunner();

  function setPaymentStatus(status: AdminPaymentStatus) {
    run(() =>
      updateProjectPaymentStatusAction({
        projectId: props.projectId,
        paymentId: props.paymentId,
        status,
      }),
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon-sm" aria-label="Payment actions">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link href={`/admin/projects/${props.projectId}`}>
              <Edit3 className="size-4" />
              View/Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setPaymentStatus("paid")}>
            <CheckCircle2 className="size-4" />
            Mark paid
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setPaymentStatus("unpaid")}>
            <RotateCcw className="size-4" />
            Mark unpaid
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              setResult(null);
              setConfirmText("");
              setReason("");
              setDialog("payment-void");
            }}
          >
            <XCircle className="size-4" />
            Void payment
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={(event) => {
              event.preventDefault();
              setResult(null);
              setConfirmText("");
              setDialog("payment-delete");
            }}
          >
            <Trash2 className="size-4" />
            Delete payment
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <StrongConfirmDialog
        open={dialog === "payment-void"}
        onOpenChange={(open) => setDialog(open ? "payment-void" : null)}
        title="Void payment?"
        description="This keeps the payment record for history but removes it from open and unpaid totals. Type VOID to confirm."
        confirmWord="VOID"
        confirmText={confirmText}
        onConfirmTextChange={setConfirmText}
        reason={reason}
        onReasonChange={setReason}
        reasonPlaceholder="Optional reason"
        actionLabel="Void payment"
        isPending={isPending}
        result={result}
        onConfirm={() =>
          run(
            () => voidPaymentAction({ paymentId: props.paymentId, reason }),
            () => setDialog(null),
          )
        }
      />

      <StrongConfirmDialog
        open={dialog === "payment-delete"}
        onOpenChange={(open) => setDialog(open ? "payment-delete" : null)}
        title="Delete payment?"
        description="This hides the payment record and preserves history. Type DELETE to confirm."
        confirmWord="DELETE"
        confirmText={confirmText}
        onConfirmTextChange={setConfirmText}
        actionLabel="Delete payment"
        destructive
        isPending={isPending}
        result={result}
        onConfirm={() =>
          run(() => deletePaymentAction({ paymentId: props.paymentId }), () =>
            setDialog(null),
          )
        }
      />
    </>
  );
}

export function FeedbackRecordActions(props: { feedbackId: string }) {
  const [dialog, setDialog] = useState<DialogKind>(null);
  const { result, setResult, isPending, run } = useActionRunner();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon-sm" aria-label="Feedback actions">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem
            onSelect={() => run(() => resolveFeedbackAction({ feedbackId: props.feedbackId }))}
          >
            <CheckCircle2 className="size-4" />
            Mark resolved
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              setResult(null);
              setDialog("feedback-archive");
            }}
          >
            <Archive className="size-4" />
            Archive
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={(event) => {
              event.preventDefault();
              setResult(null);
              setDialog("feedback-delete");
            }}
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SimpleConfirmDialog
        open={dialog === "feedback-archive"}
        onOpenChange={(open) => setDialog(open ? "feedback-archive" : null)}
        title="Archive feedback?"
        description="This removes the feedback from the normal review queue without deleting it."
        actionLabel="Archive feedback"
        isPending={isPending}
        result={result}
        onConfirm={() =>
          run(() => archiveFeedbackAction({ feedbackId: props.feedbackId }), () =>
            setDialog(null),
          )
        }
      />

      <SimpleConfirmDialog
        open={dialog === "feedback-delete"}
        onOpenChange={(open) => setDialog(open ? "feedback-delete" : null)}
        title="Delete feedback?"
        description="Use delete only for mistakes. This hides the feedback while preserving the record."
        actionLabel="Delete feedback"
        destructive
        isPending={isPending}
        result={result}
        onConfirm={() =>
          run(() => deleteFeedbackAction({ feedbackId: props.feedbackId }), () =>
            setDialog(null),
          )
        }
      />
    </>
  );
}

export function ApprovalRecordActions(props: { approvalId: string }) {
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [reason, setReason] = useState("");
  const { result, setResult, isPending, run } = useActionRunner();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon-sm" aria-label="Approval actions">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onSelect={() => run(() => approveApprovalAction({ approvalId: props.approvalId }))}>
            <CheckCircle2 className="size-4" />
            Approve
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => run(() => rejectApprovalAction({ approvalId: props.approvalId }))}>
            <RotateCcw className="size-4" />
            Reject
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              setResult(null);
              setReason("");
              setDialog("approval-cancel");
            }}
          >
            <XCircle className="size-4" />
            Cancel request
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={(event) => {
              event.preventDefault();
              setResult(null);
              setDialog("approval-delete");
            }}
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialog === "approval-cancel"} onOpenChange={(open) => setDialog(open ? "approval-cancel" : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel approval request?</DialogTitle>
            <DialogDescription>This stops the request from counting as pending while keeping the history.</DialogDescription>
          </DialogHeader>
          <Textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Optional reason" />
          <ResultMessage result={result} />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isPending}>Cancel</Button>
            </DialogClose>
            <Button
              variant="outline"
              disabled={isPending}
              onClick={() =>
                run(
                  () => cancelApprovalAction({ approvalId: props.approvalId, reason }),
                  () => setDialog(null),
                )
              }
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Cancel request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SimpleConfirmDialog
        open={dialog === "approval-delete"}
        onOpenChange={(open) => setDialog(open ? "approval-delete" : null)}
        title="Delete approval?"
        description="Use delete only for mistakes. This hides the approval while preserving history."
        actionLabel="Delete approval"
        destructive
        isPending={isPending}
        result={result}
        onConfirm={() =>
          run(() => deleteApprovalAction({ approvalId: props.approvalId }), () =>
            setDialog(null),
          )
        }
      />
    </>
  );
}

function SimpleConfirmDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  actionLabel: string;
  destructive?: boolean;
  isPending: boolean;
  result: AdminOperationActionResult | null;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{props.title}</DialogTitle>
          <DialogDescription>{props.description}</DialogDescription>
        </DialogHeader>
        <ResultMessage result={props.result} />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={props.isPending}>Cancel</Button>
          </DialogClose>
          <Button
            variant={props.destructive ? "destructive" : "outline"}
            disabled={props.isPending}
            onClick={props.onConfirm}
          >
            {props.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            {props.actionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StrongConfirmDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmWord: string;
  confirmText: string;
  onConfirmTextChange: (value: string) => void;
  reason?: string;
  onReasonChange?: (value: string) => void;
  reasonPlaceholder?: string;
  actionLabel: string;
  destructive?: boolean;
  isPending: boolean;
  result: AdminOperationActionResult | null;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{props.title}</DialogTitle>
          <DialogDescription>{props.description}</DialogDescription>
        </DialogHeader>
        <Input
          value={props.confirmText}
          onChange={(event) => props.onConfirmTextChange(event.target.value)}
          placeholder={props.confirmWord}
          autoComplete="off"
        />
        {props.onReasonChange ? (
          <Textarea
            value={props.reason}
            onChange={(event) => props.onReasonChange?.(event.target.value)}
            placeholder={props.reasonPlaceholder}
          />
        ) : null}
        <ResultMessage result={props.result} />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={props.isPending}>Cancel</Button>
          </DialogClose>
          <Button
            variant={props.destructive ? "destructive" : "outline"}
            disabled={props.isPending || props.confirmText !== props.confirmWord}
            onClick={props.onConfirm}
          >
            {props.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            {props.actionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
