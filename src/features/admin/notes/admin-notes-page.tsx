"use client";

import { FileText, Loader2, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { FormStatus } from "@/components/shared/form-status";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  createAdminNoteAction,
  deleteAdminNoteAction,
} from "@/features/admin/notes/actions";
import type { AdminNoteRecord } from "@/features/admin/notes/types";

type AdminNotesPageProps = {
  notes: AdminNoteRecord[];
};

function formatNoteDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function AdminNotesPage({ notes: initialNotes }: AdminNotesPageProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [content, setContent] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusIsSuccess, setStatusIsSuccess] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function saveNote() {
    startTransition(async () => {
      setPendingAction("save");
      setStatusMessage("");

      const result = await createAdminNoteAction({ content });

      if (!result.success || !result.note) {
        setStatusIsSuccess(false);
        setStatusMessage(result.message);
        setPendingAction(null);
        return;
      }

      const note = result.note;

      setNotes((current) => [note, ...current]);
      setContent("");
      setStatusIsSuccess(true);
      setStatusMessage(result.message);
      setPendingAction(null);
    });
  }

  function deleteNote(noteId: string) {
    startTransition(async () => {
      setPendingAction(noteId);
      setStatusMessage("");

      const result = await deleteAdminNoteAction({ noteId });

      if (!result.success || !result.noteId) {
        setStatusIsSuccess(false);
        setStatusMessage(result.message);
        setPendingAction(null);
        return;
      }

      setNotes((current) => current.filter((note) => note.id !== result.noteId));
      setStatusIsSuccess(true);
      setStatusMessage(result.message);
      setPendingAction(null);
    });
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-lg border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Write a note</CardTitle>
          <p className="text-sm text-slate-500">
            Keep quick private reminders here without turning them into tasks.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <FormStatus message={statusMessage} success={statusIsSuccess} />

          <div className="space-y-4">
            <Textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Write a note..."
              className="min-h-32 resize-y"
              disabled={isPending}
            />

            <Button
              type="button"
              onClick={saveNote}
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              {pendingAction === "save" ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving note...
                </>
              ) : (
                "Save note"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {notes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No notes yet"
          description="Your private notes will show up here after you save the first one."
        />
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <Card
              key={note.id}
              className="rounded-lg border-slate-200 shadow-sm"
            >
              <CardContent className="space-y-4 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <p className="text-sm text-slate-500">
                    {formatNoteDate(note.createdAt)}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => deleteNote(note.id)}
                    disabled={isPending}
                    className="w-full text-red-600 hover:text-red-700 sm:w-auto"
                  >
                    {pendingAction === note.id ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="size-4" />
                        Delete
                      </>
                    )}
                  </Button>
                </div>

                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                  {note.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
