import { Injectable } from '@nestjs/common';
import { EffectEnum } from '../enum/effect.enum';
import { effectMap } from '../effect-map';

@Injectable()
export class OverlayService {
  getOverlayEffect(word: string): EffectEnum {
    const wordLower = word.toLowerCase();
    return effectMap[wordLower] || EffectEnum.NONE;
  }
}
