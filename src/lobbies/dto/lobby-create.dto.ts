import { IsString, IsInt } from 'class-validator';

export class LobbyCreateDto {
  @IsString()
  wsUrl: string;

  @IsInt()
  maxPlayers: number;
}
