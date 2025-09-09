import { IsEnum, IsString } from 'class-validator';
import { EffectEnum } from 'src/events/enum/effect.enum';

export class EventPlayerNotificationDto {
  @IsString()
  word: string;

  @IsEnum(EffectEnum)
  effect: EffectEnum;

  constructor(word: string, effect: EffectEnum) {
    this.word = word;
    this.effect = effect;
  }
}
