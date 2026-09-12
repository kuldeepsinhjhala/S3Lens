import { Injectable, Logger } from '@nestjs/common';
import { CloudFrontClientService } from '../aws/cloudfront.client';
import { S3ClientService } from '../aws/s3.client';
import { StsClientService } from '../aws/sts.client';
import { EMPTY_CLOUDFRONT, type CloudFrontInfo } from '../common/types';
import {
  bucketNameFromOriginDomain,
  mapCloudFrontStatus,
} from '../common/utils/cloudfront';

type RankedDistribution = CloudFrontInfo & {
  enabled: boolean;
};

const CACHE_TTL_MS = 60_000;

@Injectable()
export class CloudfrontService {
  private readonly logger = new Logger(CloudfrontService.name);
  private cache: { at: number; map: Map<string, CloudFrontInfo> } | null = null;

  constructor(
    private readonly cloudFrontClient: CloudFrontClientService,
    private readonly s3Client: S3ClientService,
    private readonly stsClient: StsClientService,
  ) {}

  async findDistributionForBucket(bucketName: string): Promise<CloudFrontInfo> {
    const map = await this.mapDistributionsByBucket();
    return map.get(bucketName) ?? EMPTY_CLOUDFRONT;
  }

  async mapDistributionsByBucket(): Promise<Map<string, CloudFrontInfo>> {
    if (this.cache && Date.now() - this.cache.at < CACHE_TTL_MS) {
      return this.cache.map;
    }

    const map = await this.loadDistributionsByBucket();
    this.cache = { at: Date.now(), map };
    return map;
  }

  invalidateCache(): void {
    this.cache = null;
  }

  async createDistributionForBucket(
    bucketName: string,
    region: string,
  ): Promise<CloudFrontInfo> {
    const originAccessControlId =
      await this.cloudFrontClient.createOriginAccessControl(bucketName);
    let distributionId: string | undefined;

    try {
      const created = await this.cloudFrontClient.createDistributionForBucket({
        bucketName,
        region,
        originAccessControlId,
      });
      distributionId = created.distributionId;

      const accountId = await this.stsClient.getAccountId();
      await this.applyBucketPolicy(
        bucketName,
        region,
        created.distributionId,
        accountId,
      );

      this.invalidateCache();
      return {
        distributionId: created.distributionId,
        domain: created.domain,
        status: created.status,
      };
    } catch (error) {
      await this.rollbackFailedCreate(originAccessControlId, distributionId);
      throw error;
    }
  }

  async disableAndMaybeDeleteDistribution(
    distributionId: string,
  ): Promise<{ status: string }> {
    const result = await this.cloudFrontClient.getDistribution(distributionId);
    const config = result.Distribution?.DistributionConfig;
    const etag = result.ETag;

    if (!config || !etag) {
      this.invalidateCache();
      return { status: 'Disabling' };
    }

    const oacId = config.Origins?.Items?.[0]?.OriginAccessControlId;

    if (config.Enabled) {
      await this.cloudFrontClient.disableDistribution(
        distributionId,
        config,
        etag,
      );
      this.invalidateCache();
      return { status: 'Disabling' };
    }

    if (result.Distribution?.Status === 'Deployed') {
      await this.cloudFrontClient.deleteDistribution(distributionId, etag);
      if (oacId) {
        try {
          await this.cloudFrontClient.deleteOriginAccessControl(oacId);
        } catch (error) {
          this.logger.warn(
            `Could not delete origin access control ${oacId}: ${error instanceof Error ? error.message : 'unknown error'}`,
          );
        }
      }
      this.invalidateCache();
      return { status: 'Deleted' };
    }

    this.invalidateCache();
    return { status: 'Disabling' };
  }

  private async loadDistributionsByBucket(): Promise<
    Map<string, CloudFrontInfo>
  > {
    const distributions = await this.cloudFrontClient.listAllDistributions();
    const ranked = new Map<string, RankedDistribution>();

    for (const distribution of distributions) {
      for (const origin of distribution.Origins?.Items ?? []) {
        const bucket = bucketNameFromOriginDomain(origin.DomainName ?? '');
        if (!bucket || !distribution.Id || !distribution.DomainName) {
          continue;
        }

        const candidate: RankedDistribution = {
          distributionId: distribution.Id,
          domain: distribution.DomainName,
          status: mapCloudFrontStatus(
            distribution.Status,
            distribution.Enabled,
          ),
          enabled: Boolean(distribution.Enabled),
        };

        const current = ranked.get(bucket);
        if (!current || this.isBetterMatch(candidate, current)) {
          ranked.set(bucket, candidate);
        }
      }
    }

    const result = new Map<string, CloudFrontInfo>();
    for (const [bucket, value] of ranked) {
      result.set(bucket, {
        distributionId: value.distributionId,
        domain: value.domain,
        status: value.status,
      });
    }

    return result;
  }

  private async rollbackFailedCreate(
    originAccessControlId: string,
    distributionId: string | undefined,
  ): Promise<void> {
    if (distributionId) {
      try {
        await this.disableAndMaybeDeleteDistribution(distributionId);
      } catch (error) {
        this.logger.warn(
          `Could not disable distribution ${distributionId} after a failed create: ${error instanceof Error ? error.message : 'unknown error'}`,
        );
      }
      return;
    }

    try {
      await this.cloudFrontClient.deleteOriginAccessControl(
        originAccessControlId,
      );
    } catch (error) {
      this.logger.warn(
        `Could not delete origin access control ${originAccessControlId} after a failed create: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
    }
  }

  private async applyBucketPolicy(
    bucketName: string,
    region: string,
    distributionId: string,
    accountId: string,
  ): Promise<void> {
    const policy = JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'AllowCloudFrontServicePrincipalReadOnly',
          Effect: 'Allow',
          Principal: {
            Service: 'cloudfront.amazonaws.com',
          },
          Action: 's3:GetObject',
          Resource: `arn:aws:s3:::${bucketName}/*`,
          Condition: {
            StringEquals: {
              'AWS:SourceArn': `arn:aws:cloudfront::${accountId}:distribution/${distributionId}`,
            },
          },
        },
      ],
    });

    await this.s3Client.putBucketPolicy(bucketName, region, policy);
  }

  private isBetterMatch(
    candidate: RankedDistribution,
    current: RankedDistribution,
  ): boolean {
    return this.rank(candidate) > this.rank(current);
  }

  private rank(info: RankedDistribution): number {
    const deployed = info.status === 'Deployed' ? 1 : 0;
    const enabled = info.enabled ? 2 : 0;
    return enabled + deployed;
  }
}
