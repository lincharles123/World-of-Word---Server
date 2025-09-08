import { IsString } from 'class-validator';

export class LobbyJoinDto {
  @IsString()
  token: string;

  @IsString()
  username: string;
}
