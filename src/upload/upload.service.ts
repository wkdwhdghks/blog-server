import { BadRequestException, Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { UploadImageDto } from './dto/upload-image.dto';

@Injectable()
export class UploadService {
  private supabase = createClient(process.env.SUPABASE_URL ?? '', process.env.SUPABASE_SERVICE_KEY ?? '');

  async uploadImage(file: Express.Multer.File): Promise<UploadImageDto> {
    if (!file) {
      throw new BadRequestException('파일이 없습니다');
    }

    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;

    const { data, error } = await this.supabase.storage.from('images').upload(fileName, file.buffer, {
      contentType: file.mimetype,
    });

    if (error) {
      throw new BadRequestException(`업로드 실패: ${error.message}`);
    }

    const {
      data: { publicUrl },
    } = this.supabase.storage.from('images').getPublicUrl(fileName);

    return { fileName: data.path, url: publicUrl, size: file.size, mimetype: file.mimetype };
  }
}
