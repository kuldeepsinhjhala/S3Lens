import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class DeleteFolderDto {
  @ApiProperty({ example: 'images/certificates/aws/' })
  @IsString()
  @IsNotEmpty()
  prefix: string;

  @ApiPropertyOptional({
    default: false,
    description: 'When true, delete all objects under the prefix.',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  recursive?: boolean;
}
