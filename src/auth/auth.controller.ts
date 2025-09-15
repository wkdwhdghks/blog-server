import { Controller, Get, Post, Request, Response, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { Cookies } from '../common/decorators/cookies.decorator';
import { UserAuthDto } from '../users/dto/user.dto';
import { clearAuthCookies, setAuthCookies } from '../utils/cookie';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { OptionalJwtAuthGuard } from './guard/optional-jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: '내 정보 조회', description: '현재 로그인된 사용자의 정보를 반환합니다.' })
  @ApiOkResponse({ type: UserAuthDto })
  async me(@Request() req) {
    return req.user ? { isLogin: true, user: req.user } : { isLogin: false, user: null };
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @ApiOperation({ summary: '로그인', description: '이메일과 비밀번호로 로그인합니다.' })
  @ApiBody({ type: LoginDto })
  async login(@Request() req, @Response({ passthrough: true }) res) {
    const { accessToken, refreshToken } = await this.authService.login(req.user);
    setAuthCookies(res, accessToken, refreshToken);
  }

  @Post('refresh')
  @ApiOperation({ summary: '토큰 재발급', description: '리프레시 토큰을 이용해 토큰을 재발급합니다.' })
  async refresh(@Cookies('refresh_token') refreshToken: string, @Response({ passthrough: true }) res) {
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await this.authService.refresh(refreshToken);
    setAuthCookies(res, newAccessToken, newRefreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiOperation({ summary: '로그아웃', description: '리프레시 토큰을 무효화하고 인증 쿠키를 삭제합니다.' })
  async logout(@Request() req, @Response({ passthrough: true }) res) {
    await this.authService.logout(req.user.id);
    clearAuthCookies(res);
  }
}
