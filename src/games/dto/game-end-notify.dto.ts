import { IsString } from 'class-validator';

export class GameEndNotifyDto {
  @IsString()
  roomId: string;
}
