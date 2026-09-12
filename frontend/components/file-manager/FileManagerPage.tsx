"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { Breadcrumbs } from "@/components/file-manager/Breadcrumbs";
import { CreateFolderDialog } from "@/components/file-manager/CreateFolderDialog";
import { DeleteFileDialog } from "@/components/file-manager/DeleteFileDialog";
import { DeleteFolderDialog } from "@/components/file-manager/DeleteFolderDialog";
import { FileManagerHeader } from "@/components/file-manager/FileManagerHeader";
import { FilePreviewDialog } from "@/components/file-manager/FilePreviewDialog";
import { FileSearch, matchesSearch } from "@/components/file-manager/FileSearch";
import { FileTable } from "@/components/file-manager/FileTable";
import { FileToolbar } from "@/components/file-manager/FileToolbar";
import { UploadDialog } from "@/components/file-manager/UploadDialog";
import { listObjects } from "@/lib/api";
import type { Bucket } from "@/types/bucket";
import type { Folder, ObjectListResponse, S3File } from "@/types/object";

type ExtraPage = {
  folders: Folder[];
  files: S3File[];
  nextContinuationToken: string | null;
};

type FileManagerPageProps = {
  bucketName: string;
  prefix: string;
  initialBucket: Bucket | null;
  initialObjects: ObjectListResponse | null;
  initialError: string | null;
};

export function FileManagerPage({
  bucketName,
  prefix,
  initialBucket,
  initialObjects,
  initialError,
}: FileManagerPageProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(initialError);
  const [extra, setExtra] = useState<ExtraPage | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteFile, setDeleteFile] = useState<S3File | null>(null);
  const [deleteFolder, setDeleteFolder] = useState<Folder | null>(null);
  const [previewFile, setPreviewFile] = useState<S3File | null>(null);
  const searchScope = `${bucketName}:${prefix}`;
  const [search, setSearch] = useState({ scope: searchScope, query: "" });
  if (search.scope !== searchScope) {
    setSearch({ scope: searchScope, query: "" });
  }
  const query = search.scope === searchScope ? search.query : "";

  const folders = [
    ...(initialObjects?.folders ?? []),
    ...(extra?.folders ?? []),
  ];
  const files = [...(initialObjects?.files ?? []), ...(extra?.files ?? [])];
  const visibleFolders = folders.filter((folder) =>
    matchesSearch(folder.name, query),
  );
  const visibleFiles = files.filter((file) => matchesSearch(file.name, query));
  const searching = query.trim().length > 0;
  const nextContinuationToken =
    extra?.nextContinuationToken !== undefined
      ? extra.nextContinuationToken
      : (initialObjects?.nextContinuationToken ?? null);

  function afterMutation() {
    setExtra(null);
    router.refresh();
  }

  async function loadMore() {
    if (!nextContinuationToken) {
      return;
    }

    setLoadingMore(true);
    try {
      const next = await listObjects(bucketName, prefix, nextContinuationToken);
      setExtra({
        folders: [...(extra?.folders ?? []), ...next.folders],
        files: [...(extra?.files ?? []), ...next.files],
        nextContinuationToken: next.nextContinuationToken,
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to load more.");
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div className="min-h-full bg-background">
      <AppHeader backHref="/" backLabel="← Change bucket" />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <FileManagerHeader bucketName={bucketName} bucket={initialBucket} />

        <div className="mt-6 flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Breadcrumbs bucketName={bucketName} prefix={prefix} />
            <FileToolbar
              onCreateFolder={() => setCreateFolderOpen(true)}
              onUpload={() => setUploadOpen(true)}
            />
          </div>
          <FileSearch
            value={query}
            onChange={(value) => setSearch({ scope: searchScope, query: value })}
          />
        </div>

        {error ? (
          <div className="mt-4 rounded-lg border border-danger/20 bg-danger-background px-4 py-3 text-sm text-danger">
            {error}
            <button
              type="button"
              className="ml-3 font-medium underline"
              onClick={() => {
                setError(null);
                router.refresh();
              }}
            >
              Retry
            </button>
          </div>
        ) : null}

        <div className="mt-4">
          {!error || folders.length > 0 || files.length > 0 ? (
            <FileTable
              bucketName={bucketName}
              folders={visibleFolders}
              files={visibleFiles}
              emptyTitle={searching ? "No matches" : "This folder is empty"}
              emptyDescription={
                searching
                  ? `Nothing in this folder matches “${query.trim()}”.`
                  : "Upload a file or create a folder to get started."
              }
              onDeleteFolder={setDeleteFolder}
              onPreview={setPreviewFile}
              onDeleteFile={setDeleteFile}
            />
          ) : null}
        </div>

        {searching && nextContinuationToken ? (
          <p className="mt-3 text-sm text-text-secondary">
            Search only covers files already loaded on this page.
          </p>
        ) : null}

        {nextContinuationToken ? (
          <div className="mt-4">
            <button
              type="button"
              className="text-sm font-medium text-brand hover:text-brand-light"
              onClick={() => void loadMore()}
              disabled={loadingMore}
            >
              {loadingMore ? "Loading…" : "Load more"}
            </button>
          </div>
        ) : null}
      </main>

      <CreateFolderDialog
        open={createFolderOpen}
        prefix={prefix}
        bucketName={bucketName}
        onClose={() => setCreateFolderOpen(false)}
        onCreated={afterMutation}
      />
      <UploadDialog
        key={uploadOpen ? `open-${prefix}` : "closed"}
        open={uploadOpen}
        prefix={prefix}
        bucketName={bucketName}
        onClose={() => setUploadOpen(false)}
        onUploaded={afterMutation}
      />
      <DeleteFileDialog
        bucketName={bucketName}
        file={deleteFile}
        onClose={() => setDeleteFile(null)}
        onDeleted={afterMutation}
      />
      <DeleteFolderDialog
        bucketName={bucketName}
        folder={deleteFolder}
        onClose={() => setDeleteFolder(null)}
        onDeleted={afterMutation}
      />
      <FilePreviewDialog file={previewFile} onClose={() => setPreviewFile(null)} />
    </div>
  );
}
