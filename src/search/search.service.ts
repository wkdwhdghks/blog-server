import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PostDto } from '../posts/dto/post.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(query?: string): Promise<PostDto[]> {
    const where: Prisma.PostWhereInput = query
      ? {
          OR: [
            { title: { contains: query, mode: Prisma.QueryMode.insensitive } },
            { content: { contains: query, mode: Prisma.QueryMode.insensitive } },
            { tags: { some: { tag: { name: { contains: query, mode: Prisma.QueryMode.insensitive } } } } },
          ],
        }
      : {};

    const posts = await this.prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        tags: { include: { tag: { select: { name: true } } } },
      },
    });

    return posts.map(({ tags, ...post }) => ({
      ...post,
      tags: tags.map((tag) => ({ name: tag.tag.name })),
    }));
  }
}
