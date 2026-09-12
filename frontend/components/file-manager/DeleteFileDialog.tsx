"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmNameField, namesMatch } from "@/components/ui/ConfirmNameField";
import { Dialog } from "@/components/ui/Dialog";
import { ApiError, deleteObject } from "@/lib/api";
import type { S3File } from "@/types/object";

type DeleteFileDialogProps = {
  bucketName: string;
  file: S3File | null;
  onClose: () => void;
  onDeleted: () => void;
};

export function DeleteFileDialog({
  bucketName,
  file,
  onClose,
  onDeleted,
}: DeleteFileDialogProps) {
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const confirmed = Boolean(file && namesMatch(file.name, confirmation));

  function close() {
    setConfirmation("");
    setError(null);
    onClose();
  }

  async function onConfirm() {
    if (!file || !namesMatch(file.name, confirmation)) {
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await deleteObject(bucketName, file.key);
      close();
      onDeleted();
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof Error
          ? caught.message
          : "Could not delete file.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={file !== null}
      title="Delete File?"
      onClose={close}
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => void onConfirm()}
            disabled={submitting || !confirmed}
          >
            {submitting ? "Deleting…" : "Delete"}
          </Button>
        </>
      }
    >
      <p className="break-all font-medium">{file?.name}</p>
      <p className="mt-2 text-text-secondary">This cannot be undone.</p>
      {file ? (
        <ConfirmNameField
          noun="file"
          expected={file.name}
          value={confirmation}
          onChange={setConfirmation}
        />
      ) : null}
      {error ? <p className="mt-3 text-danger">{error}</p> : null}
    </Dialog>
  );
}
