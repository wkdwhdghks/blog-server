import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { PostDto } from './dto/post.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @ApiOperation({ summary: '게시글 목록 조회', description: '전체 게시글 또는 특정 태그로 필터링된 게시글 목록을 조회합니다.' })
  @ApiQuery({ name: 'tag', required: false, description: '태그명' })
  @ApiOkResponse({ type: [PostDto] })
  async posts(@Query('tag') tag?: string) {
    return await this.postsService.getPosts(tag);
  }

  @UseGuards(JwtAuthGuard)
  @Post('write')
  async write(@Body() body, @Req() req) {
    return { message: '글 작성 성공', user: req.user, data: body };
  }
}
