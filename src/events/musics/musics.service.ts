import { Injectable } from '@nestjs/common';
import { EffectEnum } from '../enum/effect.enum';
import { effectMap } from '../effect-map';

@Injectable()
export class MusicsService {
  getMusicEffect(word: string): EffectEnum {
    const wordLower = word.toLowerCase();
    return effectMap[wordLower]?.effect || EffectEnum.NONE;
  }
}
