import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UploadObjectDto {
  @ApiPropertyOptional({ example: 'images/certificates/' })
  @IsOptional()
  @IsString()
  prefix?: string;

  @ApiProperty({ example: 'certificate.pdf' })
  @IsString()
  @IsNotEmpty()
  filename: string;
}
