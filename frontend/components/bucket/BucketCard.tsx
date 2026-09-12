import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Bucket } from "@/types/bucket";

type BucketCardProps = {
  bucket: Bucket;
  onDelete: (bucket: Bucket) => void;
};

export function BucketCard({ bucket, onDelete }: BucketCardProps) {
  return (
    <article className="rounded-xl border border-border bg-background p-5">
      <h2 className="text-base font-semibold break-all">{bucket.name}</h2>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-text-secondary">Region</dt>
          <dd className="mt-1 font-medium">{bucket.region}</dd>
        </div>
        <div>
          <dt className="text-text-secondary">CloudFront</dt>
          <dd className="mt-1 font-medium break-all">
            {bucket.cloudFront.domain ?? "Not configured"}
          </dd>
        </div>
        <div>
          <dt className="text-text-secondary">Status</dt>
          <dd className="mt-1">
            <StatusBadge status={bucket.cloudFront.status} />
          </dd>
        </div>
      </dl>
      <div className="mt-5 flex justify-end gap-2">
        <Link href={`/bucket/${encodeURIComponent(bucket.name)}`}>
          <Button variant="secondary">Open</Button>
        </Link>
        <Button variant="dangerGhost" onClick={() => onDelete(bucket)}>
          Delete
        </Button>
      </div>
    </article>
  );
}
