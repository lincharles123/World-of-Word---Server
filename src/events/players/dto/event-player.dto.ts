import { IsString } from 'class-validator';

export class EventPlayerDto {
  @IsString()
  word: string;
  constructor(word: string) {
    this.word = word;
  }
}
