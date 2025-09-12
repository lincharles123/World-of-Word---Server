import { IsString } from 'class-validator';

export class EventOverlayDto {
  @IsString()
  word: string;
}
