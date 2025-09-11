export type Game = {
  roomId: string;
  username: string;
  startDate: Date;
  map: Map<string, Platform>;
  endDate?: Date;
  score?: number;
};

export type Platform = {
  // type: string;
  // is_interractive: boolean;
  // effect: string[];
};
