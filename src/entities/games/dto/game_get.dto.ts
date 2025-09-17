import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class GameGetDto {
  @IsOptional()
  @IsString()
  username?: string;
  
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  mobilePlayerNumber?: number;
}