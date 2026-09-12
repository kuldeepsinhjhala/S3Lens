"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { ApiError, createFolder } from "@/lib/api";

type CreateFolderDialogProps = {
  open: boolean;
  bucketName: string;
  prefix: string;
  onClose: () => void;
  onCreated: () => void;
};

export function CreateFolderDialog({
  open,
  bucketName,
  prefix,
  onClose,
  onCreated,
}: CreateFolderDialogProps) {
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
      await createFolder(bucketName, prefix, name);
      close();
      onCreated();
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof Error
          ? caught.message
          : "Could not create folder.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      title="Create Folder"
      onClose={close}
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={() => void onSubmit()} disabled={submitting || !name.trim()}>
            {submitting ? "Creating…" : "Create"}
          </Button>
        </>
      }
    >
      <label className="block">
        <span className="mb-1.5 block text-text-secondary">Folder name</span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-md border border-border px-3 py-2"
          placeholder="aws"
          autoComplete="off"
        />
      </label>
      <p className="mt-4 text-text-secondary">
        Location
        <span className="mt-1 block font-medium text-text-primary">
          {prefix || "Home"}
        </span>
      </p>
      {error ? <p className="mt-3 text-danger">{error}</p> : null}
    </Dialog>
  );
}
