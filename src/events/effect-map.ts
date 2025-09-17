import { EffectEnum } from './enum/effect.enum';

const EV = {
  EVENT_PLAYER: 'event:player',
  EVENT_MUSIC: 'event:music',
  EVENT_OVERLAY: 'event:overlay',
  EVENT_PLATFORM: 'event:platform',
} as const;

export class EffectWord {
  effect: EffectEnum;
  type: string[];
  constructor(effect: EffectEnum, type: string[]) {
    this.effect = effect;
    this.type = type;
  }
}

export const effectMap: { [key: string]: EffectWord } = {
  // --- SLIPPERY ---
  glace: new EffectWord(EffectEnum.SLIPPERY, [EV.EVENT_PLATFORM, EV.EVENT_PLAYER]),
  glacier: new EffectWord(EffectEnum.SLIPPERY, [EV.EVENT_PLATFORM, EV.EVENT_PLAYER]),
  givré: new EffectWord(EffectEnum.SLIPPERY, [EV.EVENT_PLATFORM, EV.EVENT_PLAYER]),
  verglas: new EffectWord(EffectEnum.SLIPPERY, [EV.EVENT_PLATFORM, EV.EVENT_PLAYER]),
  givre: new EffectWord(EffectEnum.SLIPPERY, [EV.EVENT_PLATFORM, EV.EVENT_PLAYER]),
  neige: new EffectWord(EffectEnum.SLIPPERY, [EV.EVENT_PLATFORM, EV.EVENT_PLAYER]),
  neigeux: new EffectWord(EffectEnum.SLIPPERY, [EV.EVENT_PLATFORM, EV.EVENT_PLAYER]),
  patinoire: new EffectWord(EffectEnum.SLIPPERY, [EV.EVENT_PLATFORM, EV.EVENT_PLAYER]),
  glissant: new EffectWord(EffectEnum.SLIPPERY, [EV.EVENT_PLATFORM, EV.EVENT_PLAYER]),
  glisse: new EffectWord(EffectEnum.SLIPPERY, [EV.EVENT_PLATFORM, EV.EVENT_PLAYER]),

  // --- JUMPING ---
  saut: new EffectWord(EffectEnum.JUMPING, [EV.EVENT_PLAYER, EV.EVENT_PLATFORM]),
  bond: new EffectWord(EffectEnum.JUMPING, [EV.EVENT_PLAYER, EV.EVENT_PLATFORM]),
  sauter: new EffectWord(EffectEnum.JUMPING, [EV.EVENT_PLAYER, EV.EVENT_PLATFORM]),
  bondir: new EffectWord(EffectEnum.JUMPING, [EV.EVENT_PLAYER, EV.EVENT_PLATFORM]),
  sautillant: new EffectWord(EffectEnum.JUMPING, [EV.EVENT_PLAYER, EV.EVENT_PLATFORM]),
  sautille: new EffectWord(EffectEnum.JUMPING, [EV.EVENT_PLAYER, EV.EVENT_PLATFORM]),
  rebond: new EffectWord(EffectEnum.JUMPING, [EV.EVENT_PLATFORM, EV.EVENT_PLAYER]),
  rebondir: new EffectWord(EffectEnum.JUMPING, [EV.EVENT_PLATFORM, EV.EVENT_PLAYER]),
  élan: new EffectWord(EffectEnum.JUMPING, [EV.EVENT_PLAYER, EV.EVENT_PLATFORM]),
  sursaut: new EffectWord(EffectEnum.JUMPING, [EV.EVENT_PLAYER, EV.EVENT_PLATFORM]),

  // --- FORWARD ---
  avance: new EffectWord(EffectEnum.FORWARD, [EV.EVENT_PLAYER, EV.EVENT_PLATFORM]),
  avancer: new EffectWord(EffectEnum.FORWARD, [EV.EVENT_PLAYER, EV.EVENT_PLATFORM]),
  avant: new EffectWord(EffectEnum.FORWARD, [EV.EVENT_PLAYER, EV.EVENT_PLATFORM]),
  foncer: new EffectWord(EffectEnum.FORWARD, [EV.EVENT_PLAYER, EV.EVENT_PLATFORM]),
  charger: new EffectWord(EffectEnum.FORWARD, [EV.EVENT_PLAYER, EV.EVENT_PLATFORM]),
  progresser: new EffectWord(EffectEnum.FORWARD, [EV.EVENT_PLAYER, EV.EVENT_PLATFORM]),
  pousser: new EffectWord(EffectEnum.FORWARD, [EV.EVENT_PLAYER, EV.EVENT_PLATFORM]),
  propulser: new EffectWord(EffectEnum.FORWARD, [EV.EVENT_PLAYER, EV.EVENT_PLATFORM]),
  sprint: new EffectWord(EffectEnum.FORWARD, [EV.EVENT_PLAYER, EV.EVENT_PLATFORM]),
  accélérer: new EffectWord(EffectEnum.FORWARD, [EV.EVENT_PLAYER, EV.EVENT_PLATFORM]),

  // --- BACKWARD ---
  recul: new EffectWord(EffectEnum.BACKWARD, [EV.EVENT_PLATFORM]),
  reculer: new EffectWord(EffectEnum.BACKWARD, [EV.EVENT_PLATFORM]),
  arrière: new EffectWord(EffectEnum.BACKWARD, [EV.EVENT_PLATFORM]),
  retour: new EffectWord(EffectEnum.BACKWARD, [EV.EVENT_PLATFORM]),
  retrait: new EffectWord(EffectEnum.BACKWARD, [EV.EVENT_PLATFORM]),
  reculade: new EffectWord(EffectEnum.BACKWARD, [EV.EVENT_PLATFORM]),
  rétrograder: new EffectWord(EffectEnum.BACKWARD, [EV.EVENT_PLATFORM]),
  renverser: new EffectWord(EffectEnum.BACKWARD, [EV.EVENT_PLATFORM]),
  inverser: new EffectWord(EffectEnum.BACKWARD, [EV.EVENT_PLATFORM]),
  retourner: new EffectWord(EffectEnum.BACKWARD, [EV.EVENT_PLATFORM]),

  // --- BOUNCY ---
  trampoline: new EffectWord(EffectEnum.BOUNCY, [EV.EVENT_PLATFORM, EV.EVENT_PLAYER]),
  tremplin: new EffectWord(EffectEnum.BOUNCY, [EV.EVENT_PLATFORM, EV.EVENT_PLAYER]),
  ressort: new EffectWord(EffectEnum.BOUNCY, [EV.EVENT_PLATFORM, EV.EVENT_PLAYER]),
  élastique: new EffectWord(EffectEnum.BOUNCY, [EV.EVENT_PLATFORM, EV.EVENT_PLAYER]),
  caoutchouc: new EffectWord(EffectEnum.BOUNCY, [EV.EVENT_PLATFORM, EV.EVENT_PLAYER]),
  souple: new EffectWord(EffectEnum.BOUNCY, [EV.EVENT_PLATFORM, EV.EVENT_PLAYER]),
  bondissant: new EffectWord(EffectEnum.BOUNCY, [EV.EVENT_PLATFORM, EV.EVENT_PLAYER]),
  rebondissant: new EffectWord(EffectEnum.BOUNCY, [EV.EVENT_PLATFORM, EV.EVENT_PLAYER]),
  balle: new EffectWord(EffectEnum.BOUNCY, [EV.EVENT_PLATFORM, EV.EVENT_PLAYER]),
  ballon: new EffectWord(EffectEnum.BOUNCY, [EV.EVENT_PLATFORM, EV.EVENT_PLAYER]),

  // --- GROUNDING ---
  ancrage: new EffectWord(EffectEnum.GROUNDING, [EV.EVENT_PLAYER, EV.EVENT_PLATFORM]),
  ancrer: new EffectWord(EffectEnum.GROUNDING, [EV.EVENT_PLAYER, EV.EVENT_PLATFORM]),
  ancré: new EffectWord(EffectEnum.GROUNDING, [EV.EVENT_PLAYER, EV.EVENT_PLATFORM]),
  stabiliser: new EffectWord(EffectEnum.GROUNDING, [EV.EVENT_PLAYER, EV.EVENT_PLATFORM]),
  stabilité: new EffectWord(EffectEnum.GROUNDING, [EV.EVENT_PLAYER, EV.EVENT_PLATFORM]),
  lester: new EffectWord(EffectEnum.GROUNDING, [EV.EVENT_PLAYER, EV.EVENT_PLATFORM]),
  plomber: new EffectWord(EffectEnum.GROUNDING, [EV.EVENT_PLAYER, EV.EVENT_PLATFORM]),
  solide: new EffectWord(EffectEnum.GROUNDING, [EV.EVENT_PLAYER, EV.EVENT_PLATFORM]),
  lourd: new EffectWord(EffectEnum.GROUNDING, [EV.EVENT_PLAYER, EV.EVENT_PLATFORM]),
  adhérer: new EffectWord(EffectEnum.GROUNDING, [EV.EVENT_PLAYER, EV.EVENT_PLATFORM]),
};
