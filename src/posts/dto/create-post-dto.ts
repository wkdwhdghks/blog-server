import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ description: '제목' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: '내용' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: '요약' })
  @IsString()
  @IsNotEmpty()
  summary: string;

  @ApiProperty({ description: '예상 읽기 시간' })
  @IsNumber()
  @Min(0)
  readingTime: number;

  @ApiProperty({ description: '태그명 목록', type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  tags: string[];
}
