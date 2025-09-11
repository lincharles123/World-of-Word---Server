import { EffectEnum } from './enum/effect.enum';

const EV = {
    EVENT_PLAYER: 'event:player',
    EVENT_MUSIC: 'event:music',
    EVENT_OVERLAY: 'event:overlay',
    EVENT_PLATFORM: 'event:platform',
} as const;

export class EffectWord {
  effect: EffectEnum;
  type: string;
  constructor(effect: EffectEnum, type: string) {
    this.effect = effect;
    this.type = type;
  }
}

export const effectMap: { [key: string]: EffectWord } = {
  // Effets glissants
  glace: new EffectWord(EffectEnum.SLIPPERY, EV.EVENT_PLATFORM),
  glacier: new EffectWord(EffectEnum.SLIPPERY, EV.EVENT_PLATFORM),
  givré: new EffectWord(EffectEnum.SLIPPERY, EV.EVENT_PLATFORM),
  verglas: new EffectWord(EffectEnum.SLIPPERY, EV.EVENT_PLATFORM),
  givre: new EffectWord(EffectEnum.SLIPPERY, EV.EVENT_PLATFORM),
  neige: new EffectWord(EffectEnum.SLIPPERY, EV.EVENT_PLATFORM),
  neigeux: new EffectWord(EffectEnum.SLIPPERY, EV.EVENT_PLATFORM),
  patinoire: new EffectWord(EffectEnum.SLIPPERY, EV.EVENT_PLATFORM),
  glissant: new EffectWord(EffectEnum.SLIPPERY, EV.EVENT_PLATFORM),
  glisse: new EffectWord(EffectEnum.SLIPPERY, EV.EVENT_PLATFORM),

  // Effets de saut
  saut: new EffectWord(EffectEnum.JUMP, EV.EVENT_PLAYER),
  bond: new EffectWord(EffectEnum.JUMP, EV.EVENT_PLAYER),
  sauter: new EffectWord(EffectEnum.JUMP, EV.EVENT_PLAYER),
  bondir: new EffectWord(EffectEnum.JUMP, EV.EVENT_PLAYER),
  sautillant: new EffectWord(EffectEnum.JUMP, EV.EVENT_PLAYER),
  sautille: new EffectWord(EffectEnum.JUMP, EV.EVENT_PLAYER),
  rebond: new EffectWord(EffectEnum.JUMP, EV.EVENT_PLATFORM),
  rebondir: new EffectWord(EffectEnum.JUMP, EV.EVENT_PLATFORM),
  élan: new EffectWord(EffectEnum.JUMP, EV.EVENT_PLAYER),
  sursaut: new EffectWord(EffectEnum.JUMP, EV.EVENT_PLAYER),

  // Effets d'inversion
  inverser: new EffectWord(EffectEnum.INVERT, EV.EVENT_PLATFORM),
  retourner: new EffectWord(EffectEnum.INVERT, EV.EVENT_PLATFORM),
  inverse: new EffectWord(EffectEnum.INVERT, EV.EVENT_PLATFORM),
  retourne: new EffectWord(EffectEnum.INVERT, EV.EVENT_PLATFORM),
  inversé: new EffectWord(EffectEnum.INVERT, EV.EVENT_PLATFORM),
  retourné: new EffectWord(EffectEnum.INVERT, EV.EVENT_PLATFORM),
  contraire: new EffectWord(EffectEnum.INVERT, EV.EVENT_PLATFORM),
  opposé: new EffectWord(EffectEnum.INVERT, EV.EVENT_PLATFORM),
  renverser: new EffectWord(EffectEnum.INVERT, EV.EVENT_PLATFORM),
  renverse: new EffectWord(EffectEnum.INVERT, EV.EVENT_PLATFORM),
};
