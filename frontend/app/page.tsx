import { BucketPage } from "@/components/bucket/BucketPage";
import { listBuckets } from "@/lib/api";
import type { Bucket } from "@/types/bucket";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let buckets: Bucket[] = [];
  let error: string | null = null;

  try {
    const result = await listBuckets();
    buckets = result.buckets;
  } catch (caught) {
    error =
      caught instanceof Error ? caught.message : "Failed to load buckets.";
  }

  return <BucketPage initialBuckets={buckets} initialError={error} />;
}
