import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Bucket } from "@/types/bucket";

type FileManagerHeaderProps = {
  bucketName: string;
  bucket: Bucket | null;
};

export function FileManagerHeader({ bucketName, bucket }: FileManagerHeaderProps) {
  return (
    <section>
      <h1 className="text-2xl font-semibold break-all">{bucket?.name ?? bucketName}</h1>
      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <p>
          <span className="text-text-secondary">Region: </span>
          <span className="font-medium">{bucket?.region ?? "—"}</span>
        </p>
        <p>
          <span className="text-text-secondary">CloudFront: </span>
          <span className="font-medium break-all">
            {bucket?.cloudFront.domain ?? "Not configured"}
          </span>
        </p>
        <StatusBadge status={bucket?.cloudFront.status ?? null} />
      </div>
    </section>
  );
}
