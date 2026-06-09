import { Download, FileText, ImageIcon, File } from "lucide-react";

import type { ClientPortalFile } from "@/features/client/portal/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatShortDate } from "@/lib/format";

type ClientFilesGridProps = {
  files: ClientPortalFile[];
};

function getFileIcon(type: ClientPortalFile["type"]) {
  if (type === "image") return ImageIcon;
  if (type === "docx") return File;
  return FileText;
}

export function ClientFilesGrid({ files }: ClientFilesGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {files.map((file) => {
        const Icon = getFileIcon(file.type);

        return (
          <Card
            key={file.id}
            className="rounded-2xl border-slate-200 shadow-sm"
          >
            <CardContent className="p-5">
              <div className="grid size-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                <Icon className="size-6" />
              </div>

              <p className="mt-4 font-semibold text-slate-950">{file.name}</p>
              <p className="mt-1 text-sm text-slate-500">{file.category}</p>

              <div className="mt-4 space-y-1 text-sm text-slate-600">
                <p>Size: {file.size}</p>
                <p>Uploaded: {formatShortDate(file.uploadedAt)}</p>
              </div>

              <Button variant="outline" className="mt-5 w-full">
                <Download className="mr-2 size-4" />
                Download
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}