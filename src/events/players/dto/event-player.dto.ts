import { IsString } from 'class-validator';

export class EventPlayerDto {
  @IsString()
  word: string;
}
