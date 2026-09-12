export type CloudFrontInfo = {
  distributionId: string | null;
  domain: string | null;
  status: string | null;
};

export type Bucket = {
  name: string;
  region: string;
  cloudFront: CloudFrontInfo;
};
