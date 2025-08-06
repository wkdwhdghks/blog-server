// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import { User } from '@prisma/client';
// import * as bcrypt from 'bcrypt';
// import { ERROR_CODES } from '../constants/error-codes';
// import { ERROR_MESSAGES } from '../constants/error-messages';
// import { UsersService } from '../users/users.service';
// import { LoginDto } from './dto/login.dto';

// @Injectable()
// export class AuthService {
//   constructor(
//     private readonly jwtService: JwtService,
//     private readonly usersService: UsersService,
//   ) {}

//   async validateUser(loginDto: LoginDto): Promise<User> {
//     const user = await this.usersService.findByEmail(loginDto.email);
//     if (!user) throw new UnauthorizedException({ code: ERROR_CODES.LOGIN_FAILED, message: ERROR_MESSAGES.LOGIN_FAILED });

//     const isMatch = await bcrypt.compare(loginDto.password, user.password);
//     if (!isMatch) throw new UnauthorizedException({ code: ERROR_CODES.LOGIN_FAILED, message: ERROR_MESSAGES.LOGIN_FAILED });

//     return user;
//   }

//   generateToken(userId: number, expiresIn: string): string {
//     return this.jwtService.sign({ sub: userId }, { expiresIn });
//   }

//   generateAccessToken(userId: number): string {
//     return this.generateToken(userId, '1h');
//   }

//   generateRefreshToken(userId: number): string {
//     return this.generateToken(userId, '2h');
//   }

//   verifyToken(token: string): { sub: number } {
//     return this.jwtService.verify(token);
//   }

//   async refreshTokens(userId: number, refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
//     const user = await this.usersService.findById(userId);
//     if (!user || !user.refreshToken) {
//       throw new UnauthorizedException({ code: ERROR_CODES.REFRESH_TOKEN_INVALID, message: ERROR_MESSAGES.REFRESH_TOKEN_INVALID });
//     }

//     const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
//     if (!isValid) {
//       throw new UnauthorizedException({ code: ERROR_CODES.REFRESH_TOKEN_INVALID, message: ERROR_MESSAGES.REFRESH_TOKEN_INVALID });
//     }

//     const newAccessToken = this.generateAccessToken(userId);
//     const newRefreshToken = this.generateRefreshToken(userId);

//     await this.usersService.updateRefreshToken(userId, newRefreshToken);

//     return { access_token: newAccessToken, refresh_token: newRefreshToken };
//   }
// }

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ERROR_CODES } from 'src/constants/error-codes';
import { ERROR_MESSAGES } from 'src/constants/error-messages';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string): Promise<{ access_token: string }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException({ code: ERROR_CODES.LOGIN_FAILED, message: ERROR_MESSAGES.LOGIN_FAILED });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException({ code: ERROR_CODES.LOGIN_FAILED, message: ERROR_MESSAGES.LOGIN_FAILED });

    const payload = { sub: user.id, email: user.email };
    return { access_token: await this.jwtService.signAsync(payload) };
  }
}
