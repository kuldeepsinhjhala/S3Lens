export type Folder = {
  key: string;
  name: string;
};

export type S3File = {
  key: string;
  name: string;
  size: number;
  contentType: string | null;
  lastModified: string | null;
  url: string | null;
};

export type ObjectListResponse = {
  prefix: string;
  folders: Folder[];
  files: S3File[];
  nextContinuationToken: string | null;
  isTruncated: boolean;
};
