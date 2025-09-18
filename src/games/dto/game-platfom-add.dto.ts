import { IsString, IsNumber } from 'class-validator';

export class GamePlatformAddDto {
  @IsString()
  id: string;

  @IsNumber()
  x: number;

  @IsNumber()
  y: number;

  @IsNumber()
  width: number;
}
