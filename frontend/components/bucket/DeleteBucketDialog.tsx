"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmNameField, namesMatch } from "@/components/ui/ConfirmNameField";
import { Dialog } from "@/components/ui/Dialog";
import { ApiError, deleteBucket } from "@/lib/api";
import type { Bucket } from "@/types/bucket";

type DeleteBucketDialogProps = {
  bucket: Bucket | null;
  onClose: () => void;
  onDeleted: () => void;
};

export function DeleteBucketDialog({
  bucket,
  onClose,
  onDeleted,
}: DeleteBucketDialogProps) {
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [objectCount, setObjectCount] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const confirmed = Boolean(bucket && namesMatch(bucket.name, confirmation));
  const blocked = objectCount !== null && objectCount > 0;

  function close() {
    setConfirmation("");
    setError(null);
    setObjectCount(null);
    onClose();
  }

  async function onConfirm() {
    if (!bucket || !namesMatch(bucket.name, confirmation)) {
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await deleteBucket(bucket.name);
      close();
      onDeleted();
    } catch (caught) {
      if (caught instanceof ApiError) {
        setError(caught.message);
        setObjectCount(caught.objectCount ?? null);
      } else {
        setError("Could not delete bucket.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={bucket !== null}
      title="Delete Bucket"
      onClose={close}
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => void onConfirm()}
            disabled={submitting || blocked || !confirmed}
          >
            {submitting ? "Deleting…" : "Delete Bucket"}
          </Button>
        </>
      }
    >
      <p>
        Bucket: <span className="break-all font-medium">{bucket?.name}</span>
      </p>
      <p className="mt-2 text-text-secondary">This action cannot be undone.</p>
      {bucket ? (
        <ConfirmNameField
          noun="bucket"
          expected={bucket.name}
          value={confirmation}
          onChange={setConfirmation}
        />
      ) : null}
      {blocked ? (
        <p className="mt-3 rounded-md bg-danger-background px-3 py-2 text-danger">
          This bucket contains {objectCount} objects. Empty the bucket before
          deletion.
        </p>
      ) : null}
      {error && !blocked ? <p className="mt-3 text-danger">{error}</p> : null}
    </Dialog>
  );
}
