import { IsString } from 'class-validator';

export class GamePlatformRemoveDto {
  @IsString()
  id: string;
}
