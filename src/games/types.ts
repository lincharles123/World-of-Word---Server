import { AvatarDto } from 'src/events/players/dto/avatar.dto';

export type Game = {
  roomId: string;
  username: string;
  startDate: Date;
  map: Map<string, PlatformSet>;
  endDate?: Date;
  score?: number;
  wordHistory: WordHistory[];
};

export type WordHistory = {
  username: string;
  word: string;
  date: Date;
  avatar: AvatarDto;
};

export type PlatformSet = {
  platforms: Platform[];
  effect: string[];
};

export type Platform = {
  x: number;
  y: number;
  width: number;
};
