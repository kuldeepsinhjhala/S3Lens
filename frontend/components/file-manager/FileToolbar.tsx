import { FolderPlus, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";

type FileToolbarProps = {
  onCreateFolder: () => void;
  onUpload: () => void;
};

export function FileToolbar({ onCreateFolder, onUpload }: FileToolbarProps) {
  return (
    <div className="flex gap-2">
      <Button variant="secondary" onClick={onCreateFolder}>
        <FolderPlus className="h-4 w-4 text-brand" />
        Folder
      </Button>
      <Button onClick={onUpload}>
        <Upload className="h-4 w-4" />
        Upload
      </Button>
    </div>
  );
}
