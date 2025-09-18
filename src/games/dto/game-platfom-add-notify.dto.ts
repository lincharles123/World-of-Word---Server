import { IsNumber, IsString } from 'class-validator';

export class GamePlatformAddNotifyDto {
  @IsString()
  roomId: string;

  @IsString()
  id: string;

  @IsNumber()
  x: number;

  @IsNumber()
  y: number;

  @IsNumber()
  width: number;
}
