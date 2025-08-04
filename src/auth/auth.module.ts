import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [JwtModule.register({ global: true, secret: process.env.JWT_SECRET, signOptions: { expiresIn: '10s' } })],
  controllers: [AuthController],
  providers: [AuthService, UserService],
})
export class AuthModule {}
