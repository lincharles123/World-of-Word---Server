import { IsEnum, IsString } from 'class-validator';
import { LobbyState } from '../enums/lobby-state.enum';

export class LobbyJoinSuccessDto {
  @IsString()
  roomId: string;

  @IsString()
  username: string;

  @IsString()
  socketId: string;
}
