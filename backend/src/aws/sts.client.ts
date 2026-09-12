import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GetCallerIdentityCommand, STSClient } from '@aws-sdk/client-sts';

@Injectable()
export class StsClientService {
  private readonly client: STSClient;
  private accountId: string | null = null;

  constructor(configService: ConfigService) {
    this.client = new STSClient({
      region: configService.get<string>('AWS_REGION') ?? 'ap-south-1',
    });
  }

  async getAccountId(): Promise<string> {
    if (this.accountId) {
      return this.accountId;
    }

    const result = await this.client.send(new GetCallerIdentityCommand({}));
    if (!result.Account) {
      throw new Error('Unable to resolve AWS account id.');
    }

    this.accountId = result.Account;
    return this.accountId;
  }
}
