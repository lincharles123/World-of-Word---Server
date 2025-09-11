import { IsString } from 'class-validator';

export class LobbyClosedDto {
  @IsString()
  roomId: string;

  @IsString()
  reason: string;
}
