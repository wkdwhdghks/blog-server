import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { PostDetailDto, PostDto, UpdatePostDto } from './dto/post.dto';
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

  @Get(':id')
  @ApiOperation({ summary: '게시글 상세 조회', description: '게시글 상세 정보를 조회합니다.' })
  @ApiParam({ name: 'id', description: '게시글 ID' })
  @ApiOkResponse({ type: PostDetailDto })
  async post(@Param('id', ParseIntPipe) id: number) {
    return await this.postsService.getPost(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('write')
  async write(@Body() body, @Req() req) {
    return { message: '글 작성 성공', user: req.user, data: body };
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({ summary: '게시글 수정', description: '게시글 정보를 수정합니다.' })
  @ApiParam({ name: 'id', description: '게시글 ID' })
  @ApiBody({ type: UpdatePostDto })
  @ApiOkResponse({ type: PostDto })
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdatePostDto) {
    return await this.postsService.updatePost(id, body);
  }
}
