import "server-only";

import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { adminNotes } from "@/db/schema";
import { requireRole } from "@/lib/supabase/auth";

import type { AdminNoteRecord } from "@/features/admin/notes/types";

function toIsoString(value: Date | string) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return new Date(value).toISOString();
}

function toAdminNoteRecord(row: {
  id: string;
  content: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}): AdminNoteRecord {
  return {
    id: row.id,
    content: row.content,
    createdAt: toIsoString(row.createdAt),
    updatedAt: toIsoString(row.updatedAt),
  };
}

export async function getAdminNotes() {
  const profile = await requireRole("admin");

  const rows = await db
    .select({
      id: adminNotes.id,
      content: adminNotes.content,
      createdAt: adminNotes.createdAt,
      updatedAt: adminNotes.updatedAt,
    })
    .from(adminNotes)
    .where(eq(adminNotes.createdBy, profile.id))
    .orderBy(desc(adminNotes.createdAt));

  return rows.map(toAdminNoteRecord);
}

export { toAdminNoteRecord };
