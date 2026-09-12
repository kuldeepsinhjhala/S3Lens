import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFolderDto {
  @ApiPropertyOptional({ example: 'images/certificates/' })
  @IsOptional()
  @IsString()
  prefix?: string;

  @ApiProperty({ example: 'aws' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
