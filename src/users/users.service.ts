import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async saveRefreshToken(id: number, refreshToken: string) {
    await this.prisma.user.update({ where: { id }, data: { refreshToken: await bcrypt.hash(refreshToken, 10) } });
  }

  async removeRefreshToken(id: number) {
    await this.prisma.user.update({ where: { id }, data: { refreshToken: null } });
  }
}
