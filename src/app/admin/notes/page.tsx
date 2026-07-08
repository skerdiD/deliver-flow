import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { AdminNotesPage } from "@/features/admin/notes/admin-notes-page";
import { getAdminNotes } from "@/features/admin/notes/notes-data";

export const metadata: Metadata = {
  title: "Notes",
};

export default async function AdminNotesRoute() {
  const notes = await getAdminNotes();

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <PageHeader
        eyebrow="Notes"
        title="Private notes"
        description="Quickly write small reminders for yourself."
      />

      <AdminNotesPage notes={notes} />
    </div>
  );
}
