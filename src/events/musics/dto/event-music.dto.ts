import { IsString } from 'class-validator';

export class EventMusicDto {
  @IsString()
  word: string;
}
