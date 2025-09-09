import { IsString } from 'class-validator';

export class EventOverlayDto {
  @IsString()
  word: string;
  constructor(word: string) {
    this.word = word;
  }
}
