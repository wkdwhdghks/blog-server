import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PostDto } from './dto/post.dto';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPosts(tag?: string): Promise<PostDto[]> {
    const where = tag ? { tags: { some: { tag: { name: tag } } } } : {};

    const posts = await this.prisma.post.findMany({
      where: where,
      orderBy: { createdAt: 'desc' },
      include: { tags: { select: { tag: { select: { name: true } } } } },
    });

    return posts.map(({ tags, ...post }) => ({
      ...post,
      tags: tags.map((postTag) => ({ name: postTag.tag.name })),
    }));
  }
}
