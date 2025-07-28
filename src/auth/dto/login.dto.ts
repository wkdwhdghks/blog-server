import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'test@example.com', description: '이메일' })
  email: string;

  @ApiProperty({ example: '1234', description: '비밀번호' })
  password: string;
}
