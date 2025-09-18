import { IsString, IsEnum } from 'class-validator';
import { EffectEnum } from '../enum/effect.enum';

export class EventGlobalNotifyDto {
  @IsString()
  word: string;
  @IsString()
  username: string;
  @IsEnum(EffectEnum)
  effect: EffectEnum;
}
