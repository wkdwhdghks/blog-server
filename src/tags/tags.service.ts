import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TagDto } from './dto/tag.dto';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  async getTags(): Promise<TagDto[]> {
    const tags = await this.prisma.tag.findMany({
      select: { name: true, _count: { select: { posts: true } } },
      orderBy: { posts: { _count: 'desc' } },
    });

    return tags.map(({ name, _count }) => ({ name, count: _count.posts }));
  }
}
