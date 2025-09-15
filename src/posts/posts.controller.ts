import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { PostDto } from './dto/post.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @ApiOperation({ summary: '게시글 목록 조회', description: '게시글 전체 또는 태그별로 목록을 조회합니다.' })
  @ApiQuery({ name: 'tag', required: false })
  @ApiOkResponse({ type: [PostDto] })
  async getPosts(@Query('tag') tag?: string) {
    return await this.postsService.getPosts(tag);
  }

  @UseGuards(JwtAuthGuard)
  @Post('write')
  async writePost(@Body() body, @Req() req) {
    return { message: '글 작성 성공', user: req.user, data: body };
  }
}
