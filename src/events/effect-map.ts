import { EffectEnum } from './enum/effect.enum';

export const effectMap: { [key: string]: EffectEnum } = {
  // Effets glissants
  glace: EffectEnum.SLIPPERY,
  glacier: EffectEnum.SLIPPERY,
  verglas: EffectEnum.SLIPPERY,
  givré: EffectEnum.SLIPPERY,
  givre: EffectEnum.SLIPPERY,
  neige: EffectEnum.SLIPPERY,
  neigeux: EffectEnum.SLIPPERY,
  patinoire: EffectEnum.SLIPPERY,
  glissant: EffectEnum.SLIPPERY,
  glisse: EffectEnum.SLIPPERY,

  // Effets de saut
  saut: EffectEnum.JUMP,
  bond: EffectEnum.JUMP,
  sauter: EffectEnum.JUMP,
  bondir: EffectEnum.JUMP,
  sautillant: EffectEnum.JUMP,
  sautille: EffectEnum.JUMP,
  rebond: EffectEnum.JUMP,
  rebondir: EffectEnum.JUMP,
  élan: EffectEnum.JUMP,
  sursaut: EffectEnum.JUMP,
  grimpe: EffectEnum.JUMP,
  grimper: EffectEnum.JUMP,

  // Effets d'inversion
  inverser: EffectEnum.INVERT,
  retourner: EffectEnum.INVERT,
  inverse: EffectEnum.INVERT,
  retourne: EffectEnum.INVERT,
  inversé: EffectEnum.INVERT,
  retourné: EffectEnum.INVERT,
  contraire: EffectEnum.INVERT,
  opposé: EffectEnum.INVERT,
  renverser: EffectEnum.INVERT,
  renverse: EffectEnum.INVERT,
};
