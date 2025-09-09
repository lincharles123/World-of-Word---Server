export type Game = {
  lobbyId: string;
  username: string;
  startDate: Date;
  map: Mapp[];
  endDate?: Date;
  score?: number;
};

export type Mapp = {
  id: string;
  type: string;
  is_interractive: boolean;
  effect: string[];
};
