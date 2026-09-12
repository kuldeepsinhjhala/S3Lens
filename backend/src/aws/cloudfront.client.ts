import { Injectable } from '@nestjs/common';
import {
  CloudFrontClient,
  CreateDistributionCommand,
  CreateOriginAccessControlCommand,
  DeleteDistributionCommand,
  DeleteOriginAccessControlCommand,
  GetDistributionCommand,
  ListDistributionsCommand,
  UpdateDistributionCommand,
  type DistributionSummary,
  type DistributionConfig,
} from '@aws-sdk/client-cloudfront';
import { originDomainForBucket } from '../common/utils/cloudfront';

const CACHING_OPTIMIZED_POLICY_ID = '658327ea-f89d-4eb9-b546-0f043427c9a5';

@Injectable()
export class CloudFrontClientService {
  readonly client = new CloudFrontClient({ region: 'us-east-1' });

  async listAllDistributions(): Promise<DistributionSummary[]> {
    const items: DistributionSummary[] = [];
    let marker: string | undefined;

    do {
      const result = await this.client.send(
        new ListDistributionsCommand({
          Marker: marker,
          MaxItems: 100,
        }),
      );

      items.push(...(result.DistributionList?.Items ?? []));
      marker = result.DistributionList?.IsTruncated
        ? result.DistributionList.NextMarker
        : undefined;
    } while (marker);

    return items;
  }

  async createOriginAccessControl(bucketName: string): Promise<string> {
    const suffix = Date.now().toString(36);
    const name = `s3lens-${bucketName}-${suffix}`.slice(0, 64);

    const result = await this.client.send(
      new CreateOriginAccessControlCommand({
        OriginAccessControlConfig: {
          Name: name,
          Description: `S3Lens OAC for ${bucketName}`,
          SigningProtocol: 'sigv4',
          SigningBehavior: 'always',
          OriginAccessControlOriginType: 's3',
        },
      }),
    );

    const id = result.OriginAccessControl?.Id;
    if (!id) {
      throw new Error('CloudFront did not return an origin access control id.');
    }

    return id;
  }

  async createDistributionForBucket(params: {
    bucketName: string;
    region: string;
    originAccessControlId: string;
  }): Promise<{
    distributionId: string;
    domain: string;
    status: string;
  }> {
    const originId = `s3-${params.bucketName}`;
    const callerReference = `s3lens-${params.bucketName}-${Date.now()}`;

    const result = await this.client.send(
      new CreateDistributionCommand({
        DistributionConfig: this.buildDistributionConfig({
          callerReference,
          comment: `S3Lens:${params.bucketName}`,
          enabled: true,
          originId,
          domainName: originDomainForBucket(params.bucketName, params.region),
          originAccessControlId: params.originAccessControlId,
        }),
      }),
    );

    const distribution = result.Distribution;
    if (!distribution?.Id || !distribution.DomainName) {
      throw new Error('CloudFront did not return distribution details.');
    }

    return {
      distributionId: distribution.Id,
      domain: distribution.DomainName,
      status: distribution.Status ?? 'InProgress',
    };
  }

  async getDistribution(distributionId: string) {
    return this.client.send(new GetDistributionCommand({ Id: distributionId }));
  }

  async disableDistribution(
    distributionId: string,
    config: DistributionConfig,
    etag: string,
  ): Promise<void> {
    await this.client.send(
      new UpdateDistributionCommand({
        Id: distributionId,
        IfMatch: etag,
        DistributionConfig: {
          ...config,
          Enabled: false,
        },
      }),
    );
  }

  async deleteDistribution(
    distributionId: string,
    etag: string,
  ): Promise<void> {
    await this.client.send(
      new DeleteDistributionCommand({
        Id: distributionId,
        IfMatch: etag,
      }),
    );
  }

  async deleteOriginAccessControl(id: string): Promise<void> {
    await this.client.send(new DeleteOriginAccessControlCommand({ Id: id }));
  }

  private buildDistributionConfig(params: {
    callerReference: string;
    comment: string;
    enabled: boolean;
    originId: string;
    domainName: string;
    originAccessControlId: string;
  }): DistributionConfig {
    return {
      CallerReference: params.callerReference,
      Comment: params.comment,
      Enabled: params.enabled,
      DefaultRootObject: '',
      PriceClass: 'PriceClass_All',
      HttpVersion: 'http2',
      IsIPV6Enabled: true,
      Aliases: { Quantity: 0 },
      Origins: {
        Quantity: 1,
        Items: [
          {
            Id: params.originId,
            DomainName: params.domainName,
            OriginPath: '',
            CustomHeaders: { Quantity: 0 },
            S3OriginConfig: {
              OriginAccessIdentity: '',
            },
            OriginAccessControlId: params.originAccessControlId,
            ConnectionAttempts: 3,
            ConnectionTimeout: 10,
          },
        ],
      },
      OriginGroups: { Quantity: 0 },
      DefaultCacheBehavior: {
        TargetOriginId: params.originId,
        ViewerProtocolPolicy: 'redirect-to-https',
        AllowedMethods: {
          Quantity: 2,
          Items: ['GET', 'HEAD'],
          CachedMethods: {
            Quantity: 2,
            Items: ['GET', 'HEAD'],
          },
        },
        Compress: true,
        SmoothStreaming: false,
        FieldLevelEncryptionId: '',
        CachePolicyId: CACHING_OPTIMIZED_POLICY_ID,
        TrustedSigners: { Enabled: false, Quantity: 0 },
        TrustedKeyGroups: { Enabled: false, Quantity: 0 },
        LambdaFunctionAssociations: { Quantity: 0 },
        FunctionAssociations: { Quantity: 0 },
      },
      CacheBehaviors: { Quantity: 0 },
      CustomErrorResponses: { Quantity: 0 },
      Logging: {
        Enabled: false,
        IncludeCookies: false,
        Bucket: '',
        Prefix: '',
      },
      ViewerCertificate: {
        CloudFrontDefaultCertificate: true,
        MinimumProtocolVersion: 'TLSv1.2_2021',
      },
      Restrictions: {
        GeoRestriction: {
          RestrictionType: 'none',
          Quantity: 0,
        },
      },
      WebACLId: '',
    };
  }
}
