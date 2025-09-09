import { IsNumber } from 'class-validator';

export class GameEndDto {
  @IsNumber()
  score: number;
}
