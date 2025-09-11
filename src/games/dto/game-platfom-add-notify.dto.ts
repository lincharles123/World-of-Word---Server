import { IsString } from 'class-validator';

export class GamePlatformAddNotifyDto {
  @IsString()
  roomId: string;

  @IsString()
  id: string;
}
