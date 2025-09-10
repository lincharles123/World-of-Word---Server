import { IsEnum, IsString } from 'class-validator';
import { EffectEnum } from 'src/events/enum/effect.enum';

export class EventOverlayNotificationDto {
  @IsString()
  username: string;

  @IsString()
  word: string;

  @IsEnum(EffectEnum)
  effect: EffectEnum;

  constructor(username: string, word: string, effect: EffectEnum) {
    this.username = username;
    this.word = word;
    this.effect = effect;
  }
}
