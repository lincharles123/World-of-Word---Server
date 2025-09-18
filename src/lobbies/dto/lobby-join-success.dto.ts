import { IsString } from 'class-validator';
import { MobilePlayer } from '../types';
import { AvatarDto } from 'src/events/players/dto/avatar.dto';

export class LobbyJoinSuccessDto {
  @IsString()
  roomId: string;

  @IsString()
  username: string;

  @IsString()
  socketId: string;

  @IsString()
  players: MobilePlayer[];

  @IsString()
  avatar: AvatarDto;
}
