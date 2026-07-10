"use client";

import {
  Archive,
  CheckCircle2,
  Download,
  Edit3,
  Loader2,
  MessageSquareReply,
  MoreHorizontal,
  RotateCcw,
  Upload,
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
  replaceFileAction,
  respondToFeedbackAction,
  rejectApprovalAction,
  renameFileAction,
  resolveFeedbackAction,
  updateTaskAction,
  voidPaymentAction,
  type AdminOperationActionResult,
} from "@/features/admin/operations/actions";
import { updateProjectPaymentStatusAction } from "@/features/admin/projects/actions";
import { PROJECT_FILE_ACCEPT_ATTRIBUTE } from "@/features/projects/file-security";
import type { AdminPaymentStatus } from "@/features/admin/projects/types";

type DialogKind =
  | "task-edit"
  | "task-delete"
  | "file-replace"
  | "file-rename"
  | "file-delete"
  | "payment-void"
  | "payment-delete"
  | "feedback-respond"
  | "feedback-archive"
  | "feedback-delete"
  | "approval-cancel"
  | "approval-delete"
  | null;

function useActionRunner() {
  const router = useRouter();
  const [result, setResult] = useState<AdminOperationActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function run(
    action: () => Promise<AdminOperationActionResult>,
    onSuccess?: () => void,
  ) {
    setResult(null);
    startTransition(async () => {
      const actionResult = await action();
      setResult(actionResult);

      if (actionResult.success || actionResult.didMutate) {
        router.refresh();
      }

      if (actionResult.success) {
        onSuccess?.();
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
  if (!result) {
    return null;
  }

  const className = result.success
    ? "text-sm text-emerald-600"
    : result.didMutate
      ? "text-sm text-amber-600"
      : "text-sm text-red-600";

  return <p className={className}>{result.message}</p>;
}

function RecordActionsTrigger({ label }: { label: string }) {
  return (
    <DropdownMenuTrigger asChild>
      <Button
        variant="outline"
        size="icon"
        aria-label={label}
        className="border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-100"
      >
        <MoreHorizontal className="size-4" />
      </Button>
    </DropdownMenuTrigger>
  );
}

function RecordActionsContent({ children }: { children: React.ReactNode }) {
  return (
    <DropdownMenuContent
      side="left"
      align="start"
      sideOffset={10}
      className="w-56 p-2"
    >
      {children}
    </DropdownMenuContent>
  );
}

const recordActionItemClassName = "h-11 gap-3 px-3 text-[15px]";

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
        <RecordActionsTrigger label="Task actions" />
        <RecordActionsContent>
          <DropdownMenuItem
            className={recordActionItemClassName}
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
              className={recordActionItemClassName}
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
          <DropdownMenuSeparator className="my-1.5" />
          <DropdownMenuItem
            variant="destructive"
            className={recordActionItemClassName}
            onSelect={(event) => {
              event.preventDefault();
              setResult(null);
              setDialog("task-delete");
            }}
          >
            <Trash2 className="size-4" />
            Delete task
          </DropdownMenuItem>
        </RecordActionsContent>
      </DropdownMenu>

      <Dialog
        open={dialog === "task-edit"}
        onOpenChange={(open) => setDialog(open ? "task-edit" : null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit task</DialogTitle>
            <DialogDescription>
              Update the task details shown in the Owner workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            <Input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </div>
          <ResultMessage result={result} />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isPending}>
                Cancel
              </Button>
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
          run(
            () => deleteTaskAction({ taskId: props.taskId }),
            () => setDialog(null),
          )
        }
      />
    </>
  );
}

export function FileRecordActions(props: { fileId: string; fileName: string }) {
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [fileName, setFileName] = useState(props.fileName);
  const [replacementFile, setReplacementFile] = useState<File | null>(null);
  const [replacementLabel, setReplacementLabel] = useState(props.fileName);
  const { result, setResult, isPending, run } = useActionRunner();

  return (
    <>
      <DropdownMenu>
        <RecordActionsTrigger label="File actions" />
        <RecordActionsContent>
          <DropdownMenuItem asChild className={recordActionItemClassName}>
            <Link href={`/api/admin/files/${props.fileId}/download`}>
              <Download className="size-4" />
              Download
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            className={recordActionItemClassName}
            onSelect={(event) => {
              event.preventDefault();
              setReplacementFile(null);
              setReplacementLabel(props.fileName);
              setResult(null);
              setDialog("file-replace");
            }}
          >
            <Upload className="size-4" />
            Replace file
          </DropdownMenuItem>
          <DropdownMenuItem
            className={recordActionItemClassName}
            onSelect={(event) => {
              event.preventDefault();
              setResult(null);
              setDialog("file-rename");
            }}
          >
            <Edit3 className="size-4" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-1.5" />
          <DropdownMenuItem
            variant="destructive"
            className={recordActionItemClassName}
            onSelect={(event) => {
              event.preventDefault();
              setResult(null);
              setDialog("file-delete");
            }}
          >
            <Trash2 className="size-4" />
            Delete file
          </DropdownMenuItem>
        </RecordActionsContent>
      </DropdownMenu>

      <Dialog
        open={dialog === "file-replace"}
        onOpenChange={(open) => setDialog(open ? "file-replace" : null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Replace file</DialogTitle>
            <DialogDescription>
              Upload a new validated file. The current file stays active until
              the replacement is saved.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Display name</p>
              <Input
                aria-label="Replacement display name"
                value={replacementLabel}
                onChange={(event) => setReplacementLabel(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">
                Replacement file
              </p>
              <Input
                accept={PROJECT_FILE_ACCEPT_ATTRIBUTE}
                aria-label="Replacement file"
                type="file"
                onChange={(event) =>
                  setReplacementFile(event.target.files?.[0] ?? null)
                }
              />
            </div>
          </div>
          <ResultMessage result={result} />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              disabled={isPending || !replacementFile}
              onClick={() =>
                run(
                  async () => {
                    if (!replacementFile) {
                      return {
                        success: false,
                        message: "Choose a replacement file.",
                      };
                    }

                    const formData = new FormData();
                    formData.set("fileId", props.fileId);
                    formData.set("file", replacementFile);
                    formData.set("label", replacementLabel);

                    return replaceFileAction(formData);
                  },
                  () => setDialog(null),
                )
              }
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Replace file
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={dialog === "file-rename"}
        onOpenChange={(open) => setDialog(open ? "file-rename" : null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename file</DialogTitle>
            <DialogDescription>
              Change the display name without moving the storage object.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={fileName}
            onChange={(event) => setFileName(event.target.value)}
          />
          <ResultMessage result={result} />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isPending}>
                Cancel
              </Button>
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
        description="This hides the file immediately, then removes the storage object or queues cleanup if storage is unavailable."
        actionLabel="Delete file"
        destructive
        isPending={isPending}
        result={result}
        onConfirm={() =>
          run(
            () => deleteFileAction({ fileId: props.fileId }),
            () => setDialog(null),
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
        <RecordActionsTrigger label="Payment actions" />
        <RecordActionsContent>
          <DropdownMenuItem asChild className={recordActionItemClassName}>
            <Link href={`/admin/projects/${props.projectId}`}>
              <Edit3 className="size-4" />
              View/Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            className={recordActionItemClassName}
            onSelect={() => setPaymentStatus("paid")}
          >
            <CheckCircle2 className="size-4" />
            Mark paid
          </DropdownMenuItem>
          <DropdownMenuItem
            className={recordActionItemClassName}
            onSelect={() => setPaymentStatus("unpaid")}
          >
            <RotateCcw className="size-4" />
            Mark unpaid
          </DropdownMenuItem>
          <DropdownMenuItem
            className={recordActionItemClassName}
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
          <DropdownMenuSeparator className="my-1.5" />
          <DropdownMenuItem
            variant="destructive"
            className={recordActionItemClassName}
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
        </RecordActionsContent>
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
          run(
            () => deletePaymentAction({ paymentId: props.paymentId }),
            () => setDialog(null),
          )
        }
      />
    </>
  );
}

export function FeedbackRecordActions(props: {
  feedbackId: string;
  adminResponse?: string | null;
}) {
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [response, setResponse] = useState(props.adminResponse ?? "");
  const { result, setResult, isPending, run } = useActionRunner();

  return (
    <>
      <DropdownMenu>
        <RecordActionsTrigger label="Feedback actions" />
        <RecordActionsContent>
          <DropdownMenuItem
            className={recordActionItemClassName}
            onSelect={(event) => {
              event.preventDefault();
              setResult(null);
              setResponse(props.adminResponse ?? "");
              setDialog("feedback-respond");
            }}
          >
            <MessageSquareReply className="size-4" />
            Respond
          </DropdownMenuItem>
          <DropdownMenuItem
            className={recordActionItemClassName}
            onSelect={() =>
              run(() => resolveFeedbackAction({ feedbackId: props.feedbackId }))
            }
          >
            <CheckCircle2 className="size-4" />
            Mark resolved
          </DropdownMenuItem>
          <DropdownMenuItem
            className={recordActionItemClassName}
            onSelect={(event) => {
              event.preventDefault();
              setResult(null);
              setDialog("feedback-archive");
            }}
          >
            <Archive className="size-4" />
            Archive feedback
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-1.5" />
          <DropdownMenuItem
            variant="destructive"
            className={recordActionItemClassName}
            onSelect={(event) => {
              event.preventDefault();
              setResult(null);
              setDialog("feedback-delete");
            }}
          >
            <Trash2 className="size-4" />
            Delete feedback
          </DropdownMenuItem>
        </RecordActionsContent>
      </DropdownMenu>

      <Dialog
        open={dialog === "feedback-respond"}
        onOpenChange={(open) => setDialog(open ? "feedback-respond" : null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Respond to feedback</DialogTitle>
            <DialogDescription>
              Save a reply the client can see in their feedback history.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={response}
            onChange={(event) => setResponse(event.target.value)}
            placeholder="Write a clear next step or confirmation for the client."
            className="min-h-36"
            disabled={isPending}
          />
          <ResultMessage result={result} />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              disabled={isPending}
              onClick={() =>
                run(
                  () =>
                    respondToFeedbackAction({
                      feedbackId: props.feedbackId,
                      adminResponse: response,
                    }),
                  () => setDialog(null),
                )
              }
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Save response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SimpleConfirmDialog
        open={dialog === "feedback-archive"}
        onOpenChange={(open) => setDialog(open ? "feedback-archive" : null)}
        title="Archive feedback?"
        description="This removes the feedback from the normal review queue without deleting it."
        actionLabel="Archive feedback"
        isPending={isPending}
        result={result}
        onConfirm={() =>
          run(
            () => archiveFeedbackAction({ feedbackId: props.feedbackId }),
            () => setDialog(null),
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
          run(
            () => deleteFeedbackAction({ feedbackId: props.feedbackId }),
            () => setDialog(null),
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
        <RecordActionsTrigger label="Approval actions" />
        <RecordActionsContent>
          <DropdownMenuItem
            className={recordActionItemClassName}
            onSelect={() =>
              run(() => approveApprovalAction({ approvalId: props.approvalId }))
            }
          >
            <CheckCircle2 className="size-4" />
            Approve
          </DropdownMenuItem>
          <DropdownMenuItem
            className={recordActionItemClassName}
            onSelect={() =>
              run(() => rejectApprovalAction({ approvalId: props.approvalId }))
            }
          >
            <RotateCcw className="size-4" />
            Reject
          </DropdownMenuItem>
          <DropdownMenuItem
            className={recordActionItemClassName}
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
          <DropdownMenuSeparator className="my-1.5" />
          <DropdownMenuItem
            variant="destructive"
            className={recordActionItemClassName}
            onSelect={(event) => {
              event.preventDefault();
              setResult(null);
              setDialog("approval-delete");
            }}
          >
            <Trash2 className="size-4" />
            Delete approval
          </DropdownMenuItem>
        </RecordActionsContent>
      </DropdownMenu>

      <Dialog
        open={dialog === "approval-cancel"}
        onOpenChange={(open) => setDialog(open ? "approval-cancel" : null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel approval request?</DialogTitle>
            <DialogDescription>
              This stops the request from counting as pending while keeping the
              history.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Optional reason"
          />
          <ResultMessage result={result} />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="outline"
              disabled={isPending}
              onClick={() =>
                run(
                  () =>
                    cancelApprovalAction({
                      approvalId: props.approvalId,
                      reason,
                    }),
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
          run(
            () => deleteApprovalAction({ approvalId: props.approvalId }),
            () => setDialog(null),
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
            <Button variant="outline" disabled={props.isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant={props.destructive ? "destructive" : "outline"}
            disabled={props.isPending}
            onClick={props.onConfirm}
          >
            {props.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
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
            <Button variant="outline" disabled={props.isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant={props.destructive ? "destructive" : "outline"}
            disabled={
              props.isPending || props.confirmText !== props.confirmWord
            }
            onClick={props.onConfirm}
          >
            {props.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            {props.actionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
