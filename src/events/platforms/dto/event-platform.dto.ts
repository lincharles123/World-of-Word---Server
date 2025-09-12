import { IsNumber, IsString } from 'class-validator';

export class EventPlatformDto {
  @IsString()
  word: string;

  @IsString()
  platform: string;
}
