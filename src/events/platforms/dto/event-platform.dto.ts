import { IsNumber, IsString } from 'class-validator';

export class EventPlatformDto {
  @IsString()
  word: string;

  @IsString()
  platform: string;

  constructor(word: string, platform: string) {
    this.word = word;
    this.platform = platform;
  }
}
