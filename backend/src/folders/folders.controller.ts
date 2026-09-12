import { Body, Controller, Delete, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { BucketName } from '../common/pipes/bucket-name.pipe';
import { CreateFolderDto } from './dto/create-folder.dto';
import { DeleteFolderDto } from './dto/delete-folder.dto';
import { FoldersService } from './folders.service';

@ApiTags('folders')
@Controller('buckets/:bucketName/folders')
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a folder marker under a prefix' })
  @ApiParam({ name: 'bucketName' })
  create(@BucketName() bucketName: string, @Body() body: CreateFolderDto) {
    return this.foldersService.createFolder(bucketName, body.prefix, body.name);
  }

  @Delete()
  @ApiOperation({
    summary: 'Delete a folder. Use recursive to remove all contents.',
  })
  @ApiParam({ name: 'bucketName' })
  remove(@BucketName() bucketName: string, @Body() body: DeleteFolderDto) {
    return this.foldersService.deleteFolder(
      bucketName,
      body.prefix,
      body.recursive ?? false,
    );
  }
}
