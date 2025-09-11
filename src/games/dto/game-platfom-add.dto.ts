import { IsString } from 'class-validator';

export class GamePlatformAddDto {
  @IsString()
  id: string;
}
