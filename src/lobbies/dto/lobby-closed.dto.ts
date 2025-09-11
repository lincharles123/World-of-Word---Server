import { IsString } from 'class-validator';

export class LobbyClosedDto {
  @IsString()
  roomId: string;

  @IsString()
  reason: string;

  constructor(roomId: string, reason: string) {
    this.roomId = roomId;
    this.reason = reason;
  }
}