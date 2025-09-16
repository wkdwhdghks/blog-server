import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ description: '아이디' })
  id: number;

  @ApiProperty({ description: '이메일' })
  email: string;
}

export class UserAuthDto {
  @ApiProperty({ description: '로그인 여부' })
  isLogin: boolean;

  @ApiProperty({ description: '사용자 정보', type: UserDto })
  user: UserDto | null;
}
