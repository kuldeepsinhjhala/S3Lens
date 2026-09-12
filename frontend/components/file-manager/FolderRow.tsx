import Link from "next/link";
import { Folder } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Folder as FolderType } from "@/types/object";

type FolderRowProps = {
  folder: FolderType;
  href: string;
  onDelete: (folder: FolderType) => void;
};

export function FolderRow({ folder, href, onDelete }: FolderRowProps) {
  return (
    <tr className="border-b border-border last:border-b-0 hover:bg-background-secondary">
      <td className="px-4 py-3">
        <Link
          href={href}
          className="flex items-center gap-2 font-medium text-text-primary"
        >
          <Folder className="h-4 w-4 shrink-0 text-brand" />
          {folder.name}
        </Link>
      </td>
      <td className="px-4 py-3 text-text-secondary">Folder</td>
      <td className="px-4 py-3 text-text-secondary">—</td>
      <td className="px-4 py-3 text-text-secondary">—</td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-2">
          <Link href={href}>
            <Button variant="secondary">Open</Button>
          </Link>
          <Button variant="dangerGhost" onClick={() => onDelete(folder)}>
            Delete
          </Button>
        </div>
      </td>
    </tr>
  );
}
