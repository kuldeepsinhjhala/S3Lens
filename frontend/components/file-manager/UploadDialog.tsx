"use client";

import { useEffect, useId, useRef, useState } from "react";
import { File as FileIcon, Folder, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { ApiError, uploadObject } from "@/lib/api";
import { fileTypeLabel, formatBytes, previewKind } from "@/lib/format";

const MAX_UPLOAD_BYTES = 26_214_400;

type UploadDialogProps = {
  open: boolean;
  bucketName: string;
  prefix: string;
  onClose: () => void;
  onUploaded: () => void;
};

export function UploadDialog({
  open,
  bucketName,
  prefix,
  onClose,
  onUploaded,
}: UploadDialogProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [filename, setFilename] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  function replacePreview(next: File | null) {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    if (next && previewKind(next.name, next.type) === "image") {
      previewUrlRef.current = URL.createObjectURL(next);
    }

    setPreviewUrl(previewUrlRef.current);
  }

  function close() {
    setFile(null);
    setFilename("");
    setError(null);
    setDragging(false);
    replacePreview(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    onClose();
  }

  function chooseFile(selected: File | null) {
    if (!selected) {
      return;
    }

    if (selected.size > MAX_UPLOAD_BYTES) {
      setError(`This file is ${formatBytes(selected.size)}. The limit is 25 MB.`);
      return;
    }

    setError(null);
    setFile(selected);
    setFilename(selected.name);
    replacePreview(selected);
  }

  function clearFile() {
    setFile(null);
    setFilename("");
    setError(null);
    replacePreview(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  async function onSubmit() {
    if (!file) {
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await uploadObject({
        bucketName,
        file,
        prefix,
        filename,
      });
      close();
      onUploaded();
    } catch (caught) {
      setError(
        caught instanceof ApiError || caught instanceof Error
          ? caught.message
          : "Could not upload file.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const canUpload = Boolean(file && filename.trim() && !submitting);
  const location = prefix || "Home";

  return (
    <Dialog
      open={open}
      title="Upload file"
      onClose={close}
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={() => void onSubmit()} disabled={!canUpload}>
            {submitting ? "Uploading…" : "Upload"}
          </Button>
        </>
      }
    >
      <div className="flex items-center gap-2 rounded-lg bg-background-secondary px-3 py-2">
        <Folder className="h-4 w-4 shrink-0 text-brand" />
        <div className="min-w-0">
          <p className="text-xs text-text-secondary">Destination</p>
          <p className="truncate font-medium text-text-primary">{location}</p>
        </div>
      </div>

      <input
        id={inputId}
        ref={inputRef}
        type="file"
        className="sr-only"
        disabled={submitting}
        onChange={(event) => {
          chooseFile(event.target.files?.[0] ?? null);
        }}
      />

      {file ? (
        <div className="mt-4 rounded-xl border border-border bg-background-secondary p-3">
          <div className="flex items-start gap-3">
            {previewUrl ? (
              // Local object URL for the file the user just picked.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt=""
                className="h-12 w-12 shrink-0 rounded-lg object-cover"
              />
            ) : (
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-background text-brand">
                <FileIcon className="h-5 w-5" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-text-primary">{file.name}</p>
              <p className="mt-0.5 text-xs text-text-secondary">
                {formatBytes(file.size)}
                <span className="mx-1 text-text-muted">·</span>
                {fileTypeLabel(file.name, file.type || null)}
              </p>
            </div>
            <button
              type="button"
              aria-label="Remove file"
              disabled={submitting}
              onClick={clearFile}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-text-secondary hover:bg-background-hover hover:text-text-primary disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            disabled={submitting}
            onClick={() => inputRef.current?.click()}
            className="mt-3 text-xs font-medium text-brand hover:text-brand-light disabled:text-text-muted"
          >
            Choose a different file
          </button>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          onDragEnter={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "copy";
            setDragging(true);
          }}
          onDragLeave={(event) => {
            if (event.currentTarget.contains(event.relatedTarget as Node)) {
              return;
            }
            setDragging(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            chooseFile(event.dataTransfer.files[0] ?? null);
          }}
          className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
            dragging
              ? "border-brand bg-brand/5"
              : "border-border bg-background-secondary hover:border-brand/40 hover:bg-background"
          }`}
        >
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-background text-brand">
            <Upload className="h-5 w-5" />
          </span>
          <p className="mt-3 font-medium text-text-primary">
            Drop a file here, or browse
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            One file, up to 25 MB. The server adds a timestamp to the name.
          </p>
        </label>
      )}

      {file ? (
        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-text-secondary">Save as</span>
            <input
              value={filename}
              onChange={(event) => setFilename(event.target.value)}
              disabled={submitting}
              className="w-full rounded-md border border-border bg-background px-3 py-2"
              placeholder="certificate.pdf"
              autoComplete="off"
            />
          </label>
          <div className="rounded-lg border border-border px-3 py-2">
            <p className="text-xs text-text-secondary">Stored as</p>
            <p className="mt-1 break-all font-mono text-xs text-text-primary">
              {prefix}
              {"{timestamp}-"}
              {filename.trim() || "filename"}
            </p>
          </div>
        </div>
      ) : null}

      {submitting ? (
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-background-hover">
          <div className="h-full w-full origin-left animate-pulse bg-brand" />
        </div>
      ) : null}

      {error ? (
        <p className="mt-3 rounded-md bg-danger-background px-3 py-2 text-danger">
          {error}
        </p>
      ) : null}
    </Dialog>
  );
}
