import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TagsDto } from './dto/tag.dto';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  async getTags(): Promise<TagsDto> {
    const rawTags = await this.prisma.tag.findMany({
      select: { name: true, _count: { select: { posts: true } } },
      orderBy: { posts: { _count: 'desc' } },
    });

    const tags = rawTags.map((tag) => ({ name: tag.name, count: tag._count.posts }));

    return { total: tags.length, tags };
  }
}
