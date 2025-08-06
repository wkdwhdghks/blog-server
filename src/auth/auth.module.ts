// import { Module } from '@nestjs/common';
// import { UserService } from '../users/users.service';
// import { AuthController } from './auth.controller';
// import { AuthService } from './auth.service';

// @Module({
//   imports: [JwtModule.register({ global: true, secret: process.env.JWT_SECRET, signOptions: { expiresIn: '1h' } })],
//   controllers: [AuthController],
//   providers: [AuthService, UserService],
//   exports: [AuthService],
// })
// export class AuthModule {}

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [UsersModule, JwtModule.register({ global: true, secret: process.env.JWT_SECRET, signOptions: { expiresIn: '1h' } })],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
