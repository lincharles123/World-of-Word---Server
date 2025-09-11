import { IsString } from 'class-validator';

export class GamePlatformRemoveNotifyDto {
  @IsString()
  roomId: string;

  @IsString()
  id: string;
}
