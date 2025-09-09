import { IsString } from 'class-validator';

export class GameStartNotifyDto {
  @IsString()
  roomId: string;

  constructor(roomId: string) {
    this.roomId = roomId;
  }
}
