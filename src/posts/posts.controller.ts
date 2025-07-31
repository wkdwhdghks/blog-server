import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';

@Controller('posts')
export class PostsController {
  @UseGuards(AuthGuard)
  @Post('write')
  async writePost(@Body() body, @Req() req) {
    return { message: '글 작성 성공', user: req.user, data: body };
  }
}
