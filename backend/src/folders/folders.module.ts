import { Module } from '@nestjs/common';
import { AwsModule } from '../aws/aws.module';
import { FoldersController } from './folders.controller';
import { FoldersService } from './folders.service';

@Module({
  imports: [AwsModule],
  controllers: [FoldersController],
  providers: [FoldersService],
})
export class FoldersModule {}
