import type { Bucket } from "@/types/bucket";
import type { ObjectListResponse, S3File } from "@/types/object";

const DEFAULT_API_URL = "http://localhost:4000";

export class ApiError extends Error {
  readonly status: number;
  readonly objectCount?: number;

  constructor(message: string, status: number, objectCount?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.objectCount = objectCount;
  }
}

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getBaseUrl()}${path}`, {
    cache: "no-store",
    ...init,
  });

  const data: unknown = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      isRecord(data) && typeof data.message === "string"
        ? data.message
        : "Request failed.";
    const objectCount =
      isRecord(data) && typeof data.objectCount === "number"
        ? data.objectCount
        : undefined;
    throw new ApiError(message, response.status, objectCount);
  }

  return data as T;
}

export function listBuckets() {
  return request<{ buckets: Bucket[] }>("/api/buckets");
}

export function createBucket(name: string) {
  return request<{
    bucket: { name: string; region: string };
    cloudFront: Bucket["cloudFront"];
  }>("/api/buckets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
}

export function getBucket(bucketName: string) {
  return request<{ bucket: Bucket }>(
    `/api/buckets/${encodeURIComponent(bucketName)}`,
  );
}

export function deleteBucket(bucketName: string) {
  return request<{ success: boolean }>(
    `/api/buckets/${encodeURIComponent(bucketName)}`,
    { method: "DELETE" },
  );
}

export function listObjects(
  bucketName: string,
  prefix = "",
  continuationToken?: string,
) {
  const params = new URLSearchParams();
  if (prefix) {
    params.set("prefix", prefix);
  }
  if (continuationToken) {
    params.set("continuationToken", continuationToken);
  }
  const query = params.toString();

  return request<ObjectListResponse>(
    `/api/buckets/${encodeURIComponent(bucketName)}/objects${query ? `?${query}` : ""}`,
  );
}

export function uploadObject(params: {
  bucketName: string;
  file: File;
  prefix: string;
  filename: string;
}) {
  const body = new FormData();
  body.set("file", params.file);
  body.set("prefix", params.prefix);
  body.set("filename", params.filename);

  return request<{ object: S3File }>(
    `/api/buckets/${encodeURIComponent(params.bucketName)}/objects`,
    {
      method: "POST",
      body,
    },
  );
}

export function deleteObject(bucketName: string, key: string) {
  return request<{ success: boolean }>(
    `/api/buckets/${encodeURIComponent(bucketName)}/objects`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    },
  );
}

export function createFolder(bucketName: string, prefix: string, name: string) {
  return request<{ folder: { key: string; name: string } }>(
    `/api/buckets/${encodeURIComponent(bucketName)}/folders`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prefix, name }),
    },
  );
}

export function deleteFolder(
  bucketName: string,
  prefix: string,
  recursive: boolean,
) {
  return request<{ success: boolean }>(
    `/api/buckets/${encodeURIComponent(bucketName)}/folders`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prefix, recursive }),
    },
  );
}
