import { BucketCard } from "@/components/bucket/BucketCard";
import type { Bucket } from "@/types/bucket";

type BucketListProps = {
  buckets: Bucket[];
  onDelete: (bucket: Bucket) => void;
};

export function BucketList({ buckets, onDelete }: BucketListProps) {
  if (buckets.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-background-secondary px-6 py-16 text-center">
        <p className="font-medium">No buckets yet</p>
        <p className="mt-1 text-sm text-text-secondary">
          Create a bucket to provision S3 and a dedicated CloudFront distribution.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {buckets.map((bucket) => (
        <BucketCard key={bucket.name} bucket={bucket} onDelete={onDelete} />
      ))}
    </div>
  );
}
