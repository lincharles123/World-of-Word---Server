import { LobbyState } from './enums/lobby-state.enum';

export type MobilePlayer = {
  username: string;
  socketId: string;
};

export type Lobby = {
  roomId: string;
  wsUrl: string;
  joinToken: string;
  hostSocketId: string;
  maxPlayers: number;
  players: MobilePlayer[];
  state: LobbyState;
};
