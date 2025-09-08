import { IsString, IsInt, IsEnum } from 'class-validator';
import { LobbyState } from '../enums/lobby-state.enum';

export class LobbyCreateDto {
  @IsString()
  wsUrl: string;

  @IsInt()
  maxPlayers: number;

  @IsEnum(LobbyState)
  state: LobbyState = LobbyState.PENDING;
}
