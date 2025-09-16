import { IsString } from 'class-validator';

export class EventGlobalDto {
  @IsString()
  word: string;
}
