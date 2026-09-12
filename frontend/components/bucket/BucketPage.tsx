"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { BucketList } from "@/components/bucket/BucketList";
import { CreateBucketDialog } from "@/components/bucket/CreateBucketDialog";
import { DeleteBucketDialog } from "@/components/bucket/DeleteBucketDialog";
import { Button } from "@/components/ui/Button";
import { listBuckets } from "@/lib/api";
import type { Bucket } from "@/types/bucket";

type BucketPageProps = {
  initialBuckets: Bucket[];
  initialError: string | null;
};

export function BucketPage({ initialBuckets, initialError }: BucketPageProps) {
  const [buckets, setBuckets] = useState(initialBuckets);
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Bucket | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const result = await listBuckets();
      setBuckets(result.buckets);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to load buckets.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full bg-background">
      <AppHeader
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Create Bucket
          </Button>
        }
      />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">S3 Buckets</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage your AWS S3 storage
          </p>
        </div>

        {error ? (
          <div className="mb-4 rounded-lg border border-danger/20 bg-danger-background px-4 py-3 text-sm text-danger">
            {error}
            <button
              type="button"
              className="ml-3 font-medium underline"
              onClick={() => void refresh()}
            >
              Retry
            </button>
          </div>
        ) : null}

        {loading ? (
          <p className="text-sm text-text-secondary">Loading buckets…</p>
        ) : (
          <BucketList buckets={buckets} onDelete={setDeleteTarget} />
        )}
      </main>

      <CreateBucketDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => void refresh()}
      />
      <DeleteBucketDialog
        bucket={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDeleted={() => void refresh()}
      />
    </div>
  );
}
