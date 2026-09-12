"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmNameField, namesMatch } from "@/components/ui/ConfirmNameField";
import { Dialog } from "@/components/ui/Dialog";
import { ApiError, deleteFolder } from "@/lib/api";
import type { Folder } from "@/types/object";

type DeleteFolderDialogProps = {
  bucketName: string;
  folder: Folder | null;
  onClose: () => void;
  onDeleted: () => void;
};

export function DeleteFolderDialog({
  bucketName,
  folder,
  onClose,
  onDeleted,
}: DeleteFolderDialogProps) {
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [objectCount, setObjectCount] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const confirmed = Boolean(folder && namesMatch(folder.name, confirmation));
  const notEmpty = objectCount !== null;

  function close() {
    setConfirmation("");
    setError(null);
    setObjectCount(null);
    onClose();
  }

  async function onConfirm(recursive: boolean) {
    if (!folder || !namesMatch(folder.name, confirmation)) {
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await deleteFolder(bucketName, folder.key, recursive);
      close();
      onDeleted();
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 409) {
        setObjectCount(caught.objectCount ?? 0);
        setError(caught.message);
      } else {
        setError(
          caught instanceof Error ? caught.message : "Could not delete folder.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={folder !== null}
      title={notEmpty ? "Folder is not empty" : "Delete Folder"}
      onClose={close}
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={submitting}>
            Cancel
          </Button>
          {notEmpty ? (
            <Button
              variant="danger"
              onClick={() => void onConfirm(true)}
              disabled={submitting || !confirmed}
            >
              {submitting ? "Deleting…" : "Delete folder and contents"}
            </Button>
          ) : (
            <Button
              variant="danger"
              onClick={() => void onConfirm(false)}
              disabled={submitting || !confirmed}
            >
              {submitting ? "Deleting…" : "Delete"}
            </Button>
          )}
        </>
      }
    >
      <p className="font-medium">{folder?.name}</p>
      {notEmpty ? (
        <p className="mt-3 rounded-md bg-danger-background px-3 py-2 text-danger">
          This folder contains {objectCount} objects. To delete this folder and
          all contents, confirm recursive deletion.
        </p>
      ) : (
        <p className="mt-2 text-text-secondary">This cannot be undone.</p>
      )}
      {folder ? (
        <ConfirmNameField
          noun="folder"
          expected={folder.name}
          value={confirmation}
          onChange={setConfirmation}
        />
      ) : null}
      {error && !notEmpty ? <p className="mt-3 text-danger">{error}</p> : null}
    </Dialog>
  );
}
