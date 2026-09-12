export type CloudFrontInfo = {
  distributionId: string | null;
  domain: string | null;
  status: string | null;
};

export const EMPTY_CLOUDFRONT: CloudFrontInfo = {
  distributionId: null,
  domain: null,
  status: null,
};

export type Bucket = {
  name: string;
  region: string;
  cloudFront: CloudFrontInfo;
};

export type FolderEntry = {
  key: string;
  name: string;
};

export type ObjectEntry = {
  key: string;
  name: string;
  size: number;
  lastModified: string | null;
  contentType: string | null;
  url: string | null;
};
