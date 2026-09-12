"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { previewKind } from "@/lib/format";
import type { S3File } from "@/types/object";

type FilePreviewDialogProps = {
  file: S3File | null;
  onClose: () => void;
};

export function FilePreviewDialog({ file, onClose }: FilePreviewDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const kind = file ? previewKind(file.name, file.contentType) : "other";
  const url = file?.url;
  const open = file !== null;

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    if (open && !node.open) {
      node.showModal();
    } else if (!open && node.open) {
      node.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 m-auto h-fit max-h-[90vh] w-[min(92vw,56rem)] overflow-auto rounded-xl border border-border bg-background p-0 text-text-primary shadow-2xl backdrop:bg-[rgb(30_6_53_/_0.55)]"
    >
      <div className="relative flex max-h-[90vh] flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-3">
          <h2 className="truncate pr-8 text-sm font-semibold">{file?.name ?? "Preview"}</h2>
          <button
            type="button"
            aria-label="Close preview"
            onClick={onClose}
            className="absolute right-3 top-2.5 inline-flex h-8 w-8 items-center justify-center rounded-md text-text-secondary hover:bg-background-hover hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-4">
          {!url ? (
            <p className="text-sm text-text-secondary">
              Preview is unavailable until this bucket has a CloudFront distribution.
            </p>
          ) : kind === "image" ? (
            // CloudFront domains vary per bucket, so a plain img is required.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt={file?.name ?? ""}
              className="max-h-[78vh] max-w-full object-contain"
            />
          ) : kind === "pdf" ? (
            <iframe
              title={file?.name ?? "PDF"}
              src={url}
              className="h-[78vh] w-full rounded-md border border-border"
            />
          ) : kind === "video" ? (
            <video src={url} controls className="max-h-[78vh] w-full">
              Preview not available
            </video>
          ) : (
            <div className="py-8 text-center">
              <p className="font-medium">Preview not available</p>
              <p className="mt-1 text-sm text-text-secondary">
                This file type cannot be shown in the modal.
              </p>
              <a href={url} target="_blank" rel="noreferrer" className="mt-4 inline-block">
                <Button variant="secondary">Open file</Button>
              </a>
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
}
