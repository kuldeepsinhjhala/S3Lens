import { FileManagerPage } from "@/components/file-manager/FileManagerPage";
import { getBucket, listObjects } from "@/lib/api";
import type { Bucket } from "@/types/bucket";
import type { ObjectListResponse } from "@/types/object";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ bucketName: string }>;
  searchParams: Promise<{ prefix?: string | string[] }>;
};

export default async function BucketFileManagerPage({
  params,
  searchParams,
}: PageProps) {
  const { bucketName: rawName } = await params;
  const query = await searchParams;
  const bucketName = decodeURIComponent(rawName);
  const prefix = Array.isArray(query.prefix)
    ? (query.prefix[0] ?? "")
    : (query.prefix ?? "");

  let bucket: Bucket | null = null;
  let objects: ObjectListResponse | null = null;
  let error: string | null = null;

  try {
    const [bucketResult, objectsResult] = await Promise.all([
      getBucket(bucketName),
      listObjects(bucketName, prefix),
    ]);
    bucket = bucketResult.bucket;
    objects = objectsResult;
  } catch (caught) {
    error =
      caught instanceof Error ? caught.message : "Failed to load this bucket.";
  }

  return (
    <FileManagerPage
      key={`${bucketName}:${prefix}`}
      bucketName={bucketName}
      prefix={prefix}
      initialBucket={bucket}
      initialObjects={objects}
      initialError={error}
    />
  );
}
