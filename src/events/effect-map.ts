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
  // --- SLIPPERY ---
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

  // --- JUMPING ---
  saut: new EffectWord(EffectEnum.JUMPING, EV.EVENT_PLAYER),
  bond: new EffectWord(EffectEnum.JUMPING, EV.EVENT_PLAYER),
  sauter: new EffectWord(EffectEnum.JUMPING, EV.EVENT_PLAYER),
  bondir: new EffectWord(EffectEnum.JUMPING, EV.EVENT_PLAYER),
  sautillant: new EffectWord(EffectEnum.JUMPING, EV.EVENT_PLAYER),
  sautille: new EffectWord(EffectEnum.JUMPING, EV.EVENT_PLAYER),
  rebond: new EffectWord(EffectEnum.JUMPING, EV.EVENT_PLATFORM),
  rebondir: new EffectWord(EffectEnum.JUMPING, EV.EVENT_PLATFORM),
  élan: new EffectWord(EffectEnum.JUMPING, EV.EVENT_PLAYER),
  sursaut: new EffectWord(EffectEnum.JUMPING, EV.EVENT_PLAYER),

  // --- FORWARD ---
  avance: new EffectWord(EffectEnum.FORWARD, EV.EVENT_PLAYER),
  avancer: new EffectWord(EffectEnum.FORWARD, EV.EVENT_PLAYER),
  avant: new EffectWord(EffectEnum.FORWARD, EV.EVENT_PLAYER),
  foncer: new EffectWord(EffectEnum.FORWARD, EV.EVENT_PLAYER),
  charger: new EffectWord(EffectEnum.FORWARD, EV.EVENT_PLAYER),
  progresser: new EffectWord(EffectEnum.FORWARD, EV.EVENT_PLAYER),
  pousser: new EffectWord(EffectEnum.FORWARD, EV.EVENT_PLAYER),
  propulser: new EffectWord(EffectEnum.FORWARD, EV.EVENT_PLAYER),
  sprint: new EffectWord(EffectEnum.FORWARD, EV.EVENT_PLAYER),
  accélérer: new EffectWord(EffectEnum.FORWARD, EV.EVENT_PLAYER),

  // --- BACKWARD ---
  recul: new EffectWord(EffectEnum.BACKWARD, EV.EVENT_PLAYER),
  reculer: new EffectWord(EffectEnum.BACKWARD, EV.EVENT_PLAYER),
  arrière: new EffectWord(EffectEnum.BACKWARD, EV.EVENT_PLAYER),
  retour: new EffectWord(EffectEnum.BACKWARD, EV.EVENT_PLAYER),
  retrait: new EffectWord(EffectEnum.BACKWARD, EV.EVENT_PLAYER),
  reculade: new EffectWord(EffectEnum.BACKWARD, EV.EVENT_PLAYER),
  rétrograder: new EffectWord(EffectEnum.BACKWARD, EV.EVENT_PLAYER),
  renverser: new EffectWord(EffectEnum.BACKWARD, EV.EVENT_PLAYER),
  inverser: new EffectWord(EffectEnum.BACKWARD, EV.EVENT_PLAYER),
  retourner: new EffectWord(EffectEnum.BACKWARD, EV.EVENT_PLAYER),

  // --- BOUNCY ---
  trampoline: new EffectWord(EffectEnum.BOUNCY, EV.EVENT_PLATFORM),
  tremplin: new EffectWord(EffectEnum.BOUNCY, EV.EVENT_PLATFORM),
  ressort: new EffectWord(EffectEnum.BOUNCY, EV.EVENT_PLATFORM),
  élastique: new EffectWord(EffectEnum.BOUNCY, EV.EVENT_PLATFORM),
  caoutchouc: new EffectWord(EffectEnum.BOUNCY, EV.EVENT_PLATFORM),
  souple: new EffectWord(EffectEnum.BOUNCY, EV.EVENT_PLATFORM),
  bondissant: new EffectWord(EffectEnum.BOUNCY, EV.EVENT_PLATFORM),
  rebondissant: new EffectWord(EffectEnum.BOUNCY, EV.EVENT_PLATFORM),
  balle: new EffectWord(EffectEnum.BOUNCY, EV.EVENT_PLATFORM),
  ballon: new EffectWord(EffectEnum.BOUNCY, EV.EVENT_PLATFORM),

  // --- GROUNDING ---
  ancrage: new EffectWord(EffectEnum.GROUNDING, EV.EVENT_PLAYER),
  ancrer: new EffectWord(EffectEnum.GROUNDING, EV.EVENT_PLAYER),
  ancré: new EffectWord(EffectEnum.GROUNDING, EV.EVENT_PLAYER),
  stabiliser: new EffectWord(EffectEnum.GROUNDING, EV.EVENT_PLAYER),
  stabilité: new EffectWord(EffectEnum.GROUNDING, EV.EVENT_PLAYER),
  lester: new EffectWord(EffectEnum.GROUNDING, EV.EVENT_PLAYER),
  plomber: new EffectWord(EffectEnum.GROUNDING, EV.EVENT_PLAYER),
  solide: new EffectWord(EffectEnum.GROUNDING, EV.EVENT_PLAYER),
  lourd: new EffectWord(EffectEnum.GROUNDING, EV.EVENT_PLAYER),
  adhérer: new EffectWord(EffectEnum.GROUNDING, EV.EVENT_PLAYER),
};
