import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PostDto } from '../posts/dto/post.dto';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: '게시글 검색', description: '키워드 기반으로 게시글 제목, 내용, 태그에서 일치하는 게시글을 조회합니다.' })
  @ApiQuery({ name: 'q', required: false, description: '검색어' })
  @ApiOkResponse({ type: [PostDto] })
  async search(@Query('q') query?: string) {
    return await this.searchService.search(query);
  }
}
