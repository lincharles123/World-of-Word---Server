import { IsString } from 'class-validator';

export class GamePlatformAddDto {
  @IsString()
  id: string;

  constructor(id: string) {
    this.id = id;
  }
}