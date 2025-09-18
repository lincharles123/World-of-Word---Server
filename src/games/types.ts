export type Game = {
  roomId: string;
  username: string;
  startDate: Date;
  map: Map<string, PlatformSet>;
  endDate?: Date;
  score?: number;
};

export type PlatformSet = {
  platforms: Platform[];
  effect: string[];
};

export type Platform = {
  x: number;
  y: number;
  width: number
};
