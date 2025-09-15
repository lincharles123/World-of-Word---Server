import { IsEnum, IsString } from 'class-validator';
import { EffectEnum } from 'src/events/enum/effect.enum';

export class EventMusicNotifyDto {
  @IsString()
  username: string;

  @IsString()
  word: string;

  @IsEnum(EffectEnum)
  effect: EffectEnum;
}
