import { ApiProperty } from '@nestjs/swagger';

export class TagDto {
  @ApiProperty({ description: '태그명' })
  name: string;

  @ApiProperty({ description: '게시글 수' })
  count: number;
}

export class TagsDto {
  @ApiProperty({ description: '전체 태그 수' })
  total: number;

  @ApiProperty({ description: '태그 목록', type: [TagDto] })
  tags: TagDto[];
}
