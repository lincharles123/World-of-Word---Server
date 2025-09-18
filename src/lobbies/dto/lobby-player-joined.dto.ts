import { IsString, IsJSON } from 'class-validator';

export class LobbyPlayerJoined {
  @IsString()
  roomId: string;

  @IsString()
  username: string;

  @IsString()
  socketId: string;

  @IsString()
  avatar: string;
}
