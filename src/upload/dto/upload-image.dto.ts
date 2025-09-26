import { ApiProperty } from '@nestjs/swagger';

export class UploadImageDto {
  @ApiProperty({ description: '파일 이름' })
  fileName: string;

  @ApiProperty({ description: 'URL' })
  url: string;

  @ApiProperty({ description: '파일 크기' })
  size: number;

  @ApiProperty({ description: 'MIME 타입' })
  mimetype: string;
}
