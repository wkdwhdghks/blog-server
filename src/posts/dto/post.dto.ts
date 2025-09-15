import { ApiProperty } from '@nestjs/swagger';
import { TagDto } from 'src/tags/dto/tag.dto';

export class PostDto {
  @ApiProperty({ description: '아이디' })
  id: number;

  @ApiProperty({ description: '제목' })
  title: string;

  @ApiProperty({ description: '내용' })
  content: string;

  @ApiProperty({ description: '생성일' })
  createdAt: Date;

  @ApiProperty({ description: '수정일' })
  updatedAt: Date;

  @ApiProperty({ description: '요약' })
  summary: string;

  @ApiProperty({ description: '예상 읽기 시간' })
  readingTime: number;

  @ApiProperty({ description: '태그명 목록', type: [TagDto] })
  tags: TagDto[];
}
