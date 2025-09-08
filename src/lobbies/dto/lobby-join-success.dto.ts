import { IsString } from 'class-validator';

export class LobbyJoinSuccessDto {
  @IsString()
  roomId: string;

  @IsString()
  username: string;

  @IsString()
  socketId: string;
}
