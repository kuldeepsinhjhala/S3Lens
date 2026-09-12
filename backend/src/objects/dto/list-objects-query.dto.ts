import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ListObjectsQueryDto {
  @ApiPropertyOptional({ example: 'images/' })
  @IsOptional()
  @IsString()
  prefix?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  continuationToken?: string;
}
