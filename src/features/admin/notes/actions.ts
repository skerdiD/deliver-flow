"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { routes } from "@/config/routes";
import { db } from "@/db";
import { adminNotes } from "@/db/schema";
import { requireRole } from "@/lib/supabase/auth";

import {
  toAdminNoteRecord,
} from "@/features/admin/notes/notes-data";
import type { AdminNoteRecord } from "@/features/admin/notes/types";

export type AdminNotesActionResult = {
  success: boolean;
  message: string;
  note?: AdminNoteRecord;
  noteId?: string;
};

const createAdminNoteSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Write a note first.")
    .max(4000, "Keep notes under 4000 characters."),
});

const deleteAdminNoteSchema = z.object({
  noteId: z.string().uuid("Note id is invalid."),
});

export async function createAdminNoteAction(input: {
  content: string;
}): Promise<AdminNotesActionResult> {
  const profile = await requireRole("admin");

  const parsed = createAdminNoteSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Note content is invalid.",
    };
  }

  try {
    const [note] = await db
      .insert(adminNotes)
      .values({
        content: parsed.data.content,
        createdBy: profile.id,
      })
      .returning({
        id: adminNotes.id,
        content: adminNotes.content,
        createdAt: adminNotes.createdAt,
        updatedAt: adminNotes.updatedAt,
      });

    if (!note) {
      return {
        success: false,
        message: "Note could not be saved.",
      };
    }

    revalidatePath(routes.admin.notes);

    return {
      success: true,
      message: "Note saved.",
      note: toAdminNoteRecord(note),
    };
  } catch {
    return {
      success: false,
      message: "Note could not be saved.",
    };
  }
}

export async function deleteAdminNoteAction(input: {
  noteId: string;
}): Promise<AdminNotesActionResult> {
  const profile = await requireRole("admin");

  const parsed = deleteAdminNoteSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Note request is invalid.",
    };
  }

  try {
    const [deletedNote] = await db
      .delete(adminNotes)
      .where(
        and(
          eq(adminNotes.id, parsed.data.noteId),
          eq(adminNotes.createdBy, profile.id),
        ),
      )
      .returning({ id: adminNotes.id });

    if (!deletedNote) {
      return {
        success: false,
        message: "Note not found.",
      };
    }

    revalidatePath(routes.admin.notes);

    return {
      success: true,
      message: "Note deleted.",
      noteId: deletedNote.id,
    };
  } catch {
    return {
      success: false,
      message: "Note could not be deleted.",
    };
  }
}
