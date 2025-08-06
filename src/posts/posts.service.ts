import { Injectable } from '@nestjs/common';
import { Post } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPosts(tag?: string): Promise<Post[]> {
    if (tag) {
      return this.prisma.post.findMany({
        where: { tags: { contains: tag } },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      return this.prisma.post.findMany({ orderBy: { createdAt: 'desc' } });
    }
  }
}
