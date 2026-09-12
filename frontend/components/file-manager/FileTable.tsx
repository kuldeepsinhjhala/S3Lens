import { FileRow } from "@/components/file-manager/FileRow";
import { FolderRow } from "@/components/file-manager/FolderRow";
import type { Folder, S3File } from "@/types/object";

type FileTableProps = {
  bucketName: string;
  folders: Folder[];
  files: S3File[];
  emptyTitle?: string;
  emptyDescription?: string;
  onDeleteFolder: (folder: Folder) => void;
  onPreview: (file: S3File) => void;
  onDeleteFile: (file: S3File) => void;
};

export function FileTable({
  bucketName,
  folders,
  files,
  emptyTitle = "This folder is empty",
  emptyDescription = "Upload a file or create a folder to get started.",
  onDeleteFolder,
  onPreview,
  onDeleteFile,
}: FileTableProps) {
  if (folders.length === 0 && files.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-background-secondary px-6 py-16 text-center">
        <p className="font-medium">{emptyTitle}</p>
        <p className="mt-1 text-sm text-text-secondary">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-border bg-background-secondary text-text-secondary">
          <tr>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Size</th>
            <th className="px-4 py-3 font-medium">Modified</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {folders.map((folder) => (
            <FolderRow
              key={folder.key}
              folder={folder}
              href={`/bucket/${encodeURIComponent(bucketName)}?prefix=${encodeURIComponent(folder.key)}`}
              onDelete={onDeleteFolder}
            />
          ))}
          {files.map((file) => (
            <FileRow
              key={file.key}
              file={file}
              onPreview={onPreview}
              onDelete={onDeleteFile}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
