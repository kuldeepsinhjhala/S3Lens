"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { ApiError, createBucket } from "@/lib/api";

type CreateBucketDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export function CreateBucketDialog({
  open,
  onClose,
  onCreated,
}: CreateBucketDialogProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function close() {
    setName("");
    setError(null);
    onClose();
  }

  async function onSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      await createBucket(name);
      close();
      onCreated();
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof Error
          ? caught.message
          : "Could not create bucket.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      title="Create S3 Bucket"
      onClose={close}
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={() => void onSubmit()} disabled={submitting || !name.trim()}>
            {submitting ? "Creating…" : "Create Bucket"}
          </Button>
        </>
      }
    >
      <label className="block">
        <span className="mb-1.5 block text-text-secondary">Bucket name</span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-text-primary"
          placeholder="kuldeep-documents"
          autoComplete="off"
        />
      </label>
      <label className="mt-4 block">
        <span className="mb-1.5 block text-text-secondary">Region</span>
        <input
          value="ap-south-1"
          readOnly
          className="w-full rounded-md border border-border bg-background-secondary px-3 py-2 text-text-primary"
        />
      </label>
      {error ? <p className="mt-3 text-danger">{error}</p> : null}
    </Dialog>
  );
}
