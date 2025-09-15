import { ApiProperty } from '@nestjs/swagger';

export class TagDto {
  @ApiProperty({ description: '태그명' })
  name: string;

  @ApiProperty({ description: '게시글 수' })
  count?: number;
}
