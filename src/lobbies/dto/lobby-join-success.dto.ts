import { IsString } from 'class-validator';
import { MobilePlayer } from '../types';

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
  avatar: string;
}
