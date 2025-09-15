import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { TagDto } from './dto/tag.dto';
import { TagsService } from './tags.service';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  @ApiOperation({ summary: '태그 목록 조회', description: '모든 태그와 각 태그의 게시글 수를 조회합니다.' })
  @ApiOkResponse({ type: [TagDto] })
  async getTags(): Promise<TagDto[]> {
    return await this.tagsService.getTags();
  }
}
