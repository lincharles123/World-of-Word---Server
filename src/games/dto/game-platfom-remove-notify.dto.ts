import { IsString } from 'class-validator';

export class GamePlatformRemoveNotifyDto {
  @IsString()
  roomId: string;

  @IsString()
  id: string;

  constructor(roomId: string, id: string) {
    this.roomId = roomId;
    this.id = id;
  }
}