import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteObjectDto {
  @ApiProperty({
    example: 'images/1776000000000-certificate.pdf',
  })
  @IsString()
  @IsNotEmpty()
  key: string;
}
