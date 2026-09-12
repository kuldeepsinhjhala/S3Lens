import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBucketDto {
  @ApiProperty({ example: 'kuldeep-documents' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
