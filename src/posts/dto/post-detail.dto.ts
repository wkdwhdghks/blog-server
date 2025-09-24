import { ApiProperty } from '@nestjs/swagger';
import { PostFullDto } from './post.dto';

export class NavigationItemDto {
  @ApiProperty({ description: '게시글 ID' })
  id: number;

  @ApiProperty({ description: '게시글 제목' })
  title: string;
}

export class NavigationDto {
  @ApiProperty({ description: '이전 게시글', type: NavigationItemDto, nullable: true })
  prev: NavigationItemDto | null;

  @ApiProperty({ description: '다음 게시글', type: NavigationItemDto, nullable: true })
  next: NavigationItemDto | null;
}

export class PostDetailDto {
  @ApiProperty({ description: '게시글', type: PostFullDto })
  post: PostFullDto;

  @ApiProperty({ description: '네비게이션', type: NavigationDto })
  navigation: NavigationDto;
}
