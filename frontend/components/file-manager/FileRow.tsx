import { Eye, File } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CopyUrlButton } from "@/components/file-manager/CopyUrlButton";
import { fileTypeLabel, formatBytes, formatDate, previewKind } from "@/lib/format";
import type { S3File } from "@/types/object";

type FileRowProps = {
  file: S3File;
  onPreview: (file: S3File) => void;
  onDelete: (file: S3File) => void;
};

export function FileRow({ file, onPreview, onDelete }: FileRowProps) {
  const isImage = previewKind(file.name, file.contentType) === "image";

  return (
    <tr className="border-b border-border last:border-b-0 hover:bg-background-secondary">
      <td className="px-4 py-3">
        <span className="flex items-center gap-2 font-medium text-text-primary">
          <File className="h-4 w-4 shrink-0 text-text-muted" />
          <span className="break-all">{file.name}</span>
        </span>
      </td>
      <td className="px-4 py-3 text-text-secondary">
        {fileTypeLabel(file.name, file.contentType)}
      </td>
      <td className="px-4 py-3 text-text-secondary">{formatBytes(file.size)}</td>
      <td className="px-4 py-3 text-text-secondary">
        {formatDate(file.lastModified)}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          {isImage ? (
            <button
              type="button"
              aria-label={`View ${file.name}`}
              onClick={() => onPreview(file)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-brand hover:bg-background-hover hover:text-brand-light"
            >
              <Eye className="h-4 w-4" />
            </button>
          ) : (
            <Button variant="secondary" onClick={() => onPreview(file)}>
              View
            </Button>
          )}
          <CopyUrlButton url={file.url} />
          <Button variant="dangerGhost" onClick={() => onDelete(file)}>
            Delete
          </Button>
        </div>
      </td>
    </tr>
  );
}
