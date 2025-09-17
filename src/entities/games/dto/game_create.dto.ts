import { IsString, IsInt, IsDate } from 'class-validator';

export class CreateGameDto {
  @IsString()
  username: string;

  @IsString()
  roomId: string;

  @IsInt()
  score: number;

  @IsInt()
  mobilePlayerNumber: number;

  @IsDate()
  dateStart: Date;

  @IsDate()
  dateEnd: Date;
}
