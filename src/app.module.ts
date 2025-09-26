import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { PrismaModule } from './prisma/prisma.module';
import { SearchModule } from './search/search.module';
import { TagsModule } from './tags/tags.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [AuthModule, PostsModule, PrismaModule, SearchModule, TagsModule, UploadModule],
})
export class AppModule {}
