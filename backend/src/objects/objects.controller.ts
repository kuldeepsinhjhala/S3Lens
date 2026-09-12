import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { BucketName } from '../common/pipes/bucket-name.pipe';
import { DeleteObjectDto } from './dto/delete-object.dto';
import { ListObjectsQueryDto } from './dto/list-objects-query.dto';
import { UploadObjectDto } from './dto/upload-object.dto';
import { ObjectsService } from './objects.service';

@ApiTags('objects')
@Controller('buckets/:bucketName/objects')
export class ObjectsController {
  constructor(private readonly objectsService: ObjectsService) {}

  @Get()
  @ApiOperation({ summary: 'List files and folders for a prefix' })
  @ApiParam({ name: 'bucketName' })
  list(@BucketName() bucketName: string, @Query() query: ListObjectsQueryDto) {
    return this.objectsService.listObjects(
      bucketName,
      query.prefix,
      query.continuationToken,
    );
  }

  @Post()
  @ApiOperation({
    summary:
      'Upload a file. The server prefixes the filename with a timestamp.',
  })
  @ApiParam({ name: 'bucketName' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'filename'],
      properties: {
        file: { type: 'string', format: 'binary' },
        prefix: { type: 'string', example: 'images/' },
        filename: { type: 'string', example: 'profile.png' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @BucketName() bucketName: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadObjectDto,
  ) {
    return this.objectsService.uploadObject({
      bucketName,
      file,
      prefix: body.prefix,
      filename: body.filename,
    });
  }

  @Delete()
  @ApiOperation({ summary: 'Delete one object by key' })
  @ApiParam({ name: 'bucketName' })
  remove(@BucketName() bucketName: string, @Body() body: DeleteObjectDto) {
    return this.objectsService.deleteObject(bucketName, body.key);
  }
}
