import { IsString } from 'class-validator';

export class GameStartNotifyDto {
  @IsString()
  roomId: string;
}
