import { IsString, IsInt } from 'class-validator';

export class CreateGameDto {
  @IsString()
  username: string;

  @IsInt()
  score: number;

  @IsInt()
  mobilePlayerNumber: number;

  @IsInt()
  time: number;
}
