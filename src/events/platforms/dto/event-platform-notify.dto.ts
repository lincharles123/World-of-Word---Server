import { IsEnum, IsString } from 'class-validator';
import { EffectEnum } from 'src/events/enum/effect.enum';

export class EventPlatformNotificationDto {
  @IsString()
  username: string;

  @IsString()
  word: string;

  @IsEnum(EffectEnum)
  effect: EffectEnum;

  @IsString()
  platform: string;

  constructor(username: string, word: string, effect: EffectEnum, platform: string) {
    this.username = username;
    this.word = word;
    this.effect = effect;
    this.platform = platform;
  }
}
