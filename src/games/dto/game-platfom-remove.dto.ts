import { IsString } from 'class-validator';

export class GamePlatformRemoveDto {
  @IsString()
  id: string;

  constructor(id: string) {
    this.id = id;
  }
}