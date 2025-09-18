import { IsString, IsJSON, IsObject } from 'class-validator';
import { AvatarDto } from 'src/events/players/dto/avatar.dto';

export class LobbyPlayerJoined {
  @IsString()
  roomId: string;

  @IsString()
  username: string;

  @IsString()
  socketId: string;

  @IsObject()
  avatar: AvatarDto;
}
