import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { JwtPayload } from '../../types/jwt-payload.type';
import { UserDto } from '../../users/dto/user.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: (req: Request) => req?.cookies?.access_token,
      secretOrKey: process.env.JWT_SECRET ?? '',
    });
  }

  async validate({ sub, email }: JwtPayload): Promise<UserDto> {
    return { id: sub, email };
  }
}
