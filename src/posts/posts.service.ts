import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PostDetailDto, PostDto, UpdatePostDto } from './dto/post.dto';

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

  async getPost(id: number): Promise<PostDetailDto> {
    const [currentPost, nextPost, prevPost] = await Promise.all([
      this.prisma.post.findUnique({ where: { id }, include: { tags: { include: { tag: { select: { name: true } } } } } }),
      this.prisma.post.findFirst({ where: { id: { gt: id } }, select: { id: true, title: true }, orderBy: { id: 'asc' } }),
      this.prisma.post.findFirst({ where: { id: { lt: id } }, select: { id: true, title: true }, orderBy: { id: 'desc' } }),
    ]);

    if (!currentPost) {
      return { post: null, navigation: { prev: null, next: null } };
    }

    const post = { ...currentPost, tags: currentPost.tags.map((tag) => ({ name: tag.tag.name })) };
    const navigation = { prev: prevPost, next: nextPost };

    return { post, navigation };
  }

  async updatePost(id: number, updatePostDto: UpdatePostDto): Promise<PostDto> {
    const { tags, ...post } = updatePostDto;

    const updatedPost = await this.prisma.post.update({
      where: { id },
      data: {
        ...post,
        tags: {
          deleteMany: {},
          create: tags.map((tagName) => ({ tag: { connectOrCreate: { where: { name: tagName }, create: { name: tagName } } } })),
        },
      },
      include: { tags: { include: { tag: { select: { name: true } } } } },
    });

    return { ...updatedPost, tags: updatedPost.tags.map((tag) => ({ name: tag.tag.name })) };
  }
}
