import { IsEnum, IsJSON, IsString } from 'class-validator';
import { LobbyState } from '../enums/lobby-state.enum';

export class LobbyJoinDto {
  @IsString()
  token: string;

  @IsString()
  username: string;

  @IsString()
  avatar: string;
}
