import { Injectable, NotFoundException } from '@nestjs/common';
import { ERROR_CODES } from '../constants/error-codes';
import { ERROR_MESSAGES } from '../constants/error-messages';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post-dto';
import { PostDto } from './dto/post.dto';
import { PostDetailDto } from './dto/post-detail.dto';
import { UpdatePostDto } from './dto/update-post.dto';

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

    return posts.map(({ tags, ...post }) => ({ ...post, tags: tags.map(({ tag }) => ({ name: tag.name })) }));
  }

  async getPost(id: number): Promise<PostDetailDto> {
    const [currentPost, nextPost, prevPost] = await Promise.all([
      this.prisma.post.findUnique({ where: { id }, include: { tags: { include: { tag: { select: { name: true } } } } } }),
      this.prisma.post.findFirst({ where: { id: { gt: id } }, select: { id: true, title: true }, orderBy: { id: 'asc' } }),
      this.prisma.post.findFirst({ where: { id: { lt: id } }, select: { id: true, title: true }, orderBy: { id: 'desc' } }),
    ]);

    if (!currentPost) {
      throw new NotFoundException({ code: ERROR_CODES.POST_NOT_FOUND, message: ERROR_MESSAGES.POST_NOT_FOUND });
    }

    const post = { ...currentPost, tags: currentPost.tags.map(({ tag }) => ({ name: tag.name })) };
    const navigation = { prev: prevPost, next: nextPost };

    return { post, navigation };
  }

  async createPost(data: CreatePostDto): Promise<PostDto> {
    const { title, content, summary, readingTime, tags } = data;

    return await this.prisma.$transaction(async (prisma) => {
      const post = await prisma.post.create({ data: { title, content, summary, readingTime } });

      await this.createPostTags(post.id, tags, prisma);

      const createdPost = await prisma.post.findUnique({
        where: { id: post.id },
        include: { tags: { include: { tag: { select: { name: true } } } } },
      });

      if (!createdPost) {
        throw new NotFoundException({ code: ERROR_CODES.POST_NOT_FOUND, message: ERROR_MESSAGES.POST_NOT_FOUND });
      }

      return { ...createdPost, tags: createdPost.tags.map(({ tag }) => ({ name: tag.name })) };
    });
  }

  async updatePost(id: number, data: UpdatePostDto): Promise<PostDto> {
    const post = await this.prisma.post.findUnique({ where: { id } });

    if (!post) {
      throw new NotFoundException({ code: ERROR_CODES.POST_NOT_FOUND, message: ERROR_MESSAGES.POST_NOT_FOUND });
    }

    const { title, content, summary, readingTime, tags } = data;

    return await this.prisma.$transaction(async (prisma) => {
      await prisma.post.update({ where: { id }, data: { title, content, summary, readingTime } });

      await prisma.postTag.deleteMany({ where: { postId: id } });

      await this.createPostTags(id, tags, prisma);

      await prisma.tag.deleteMany({ where: { posts: { none: {} } } });

      const updatedPost = await prisma.post.findUnique({
        where: { id },
        include: { tags: { include: { tag: { select: { name: true } } } } },
      });

      if (!updatedPost) {
        throw new NotFoundException({ code: ERROR_CODES.POST_NOT_FOUND, message: ERROR_MESSAGES.POST_NOT_FOUND });
      }

      return { ...updatedPost, tags: updatedPost.tags.map(({ tag }) => ({ name: tag.name })) };
    });
  }

  private async createPostTags(postId: number, tags: string[], prisma) {
    if (tags && tags.length > 0) {
      for (const name of tags) {
        const tag = await prisma.tag.upsert({ where: { name }, create: { name }, update: {} });
        await prisma.postTag.create({ data: { postId, tagId: tag.id } });
      }
    }
  }
}
