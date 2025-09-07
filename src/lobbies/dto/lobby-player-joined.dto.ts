import { IsString } from 'class-validator';

export class LobbyPlayerJoined {
  @IsString()
  roomId: string;

  @IsString()
  username: string;

  @IsString()
  socketId: string;
}
