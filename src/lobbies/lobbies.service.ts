import { Injectable } from '@nestjs/common';
import { Lobby, MobilePlayer } from './types';
import { randomUUID } from 'node:crypto';
import { LobbyState } from './enums/lobby-state.enum';

@Injectable()
export class LobbiesService {
  private lobbies = new Map<string, Lobby>();
  private tokenToRoom = new Map<string, string>();

  create(wsUrl: string, hostSocketId: string, maxPlayers = 4): Lobby {
    const roomId = randomUUID();
    const joinToken = randomUUID().replace(/-/g, '');

    const lobby: Lobby = {
      roomId,
      wsUrl,
      joinToken,
      hostSocketId,
      maxPlayers,
      players: [],
      state: LobbyState.PENDING,
    };

    this.lobbies.set(roomId, lobby);
    this.tokenToRoom.set(joinToken, roomId);

    console.log(`🎮 Lobby créé: ${lobby.roomId}`);
    console.log(`   ↳ Host socket: ${lobby.hostSocketId}`);
    console.log(`   ↳ Join token: ${lobby.joinToken}`);

    return lobby;
  }

  findByToken(token: string): Lobby {
    const roomId = this.tokenToRoom.get(token);

    return this.lobbies.get(roomId);
  }

  findByRoomId(roomId: string): Lobby {
    return this.lobbies.get(roomId);
  }

  addMobile(lobby: Lobby, username: string, socketId: string): MobilePlayer {
    if (lobby.state !== LobbyState.PENDING) {
      throw new Error('Cannot join a lobby that is not pending');
    }
    const player: MobilePlayer = { username, socketId };
    lobby.players.push(player);

    console.log(`📱 Mobile "${player.username}" ajouté dans lobby ${lobby.roomId}`);
    console.log(`   ↳ Socket id: ${player.socketId}`);
    console.log(`   ↳ Joueurs actuels: ${lobby.players.map((p) => p.username).join(', ')}`);

    return player;
  }

  start(roomId: string): void {
    const lobby = this.lobbies.get(roomId);
    lobby.state = LobbyState.INGAME;
    return;
  }

  reset(roomId: string): void {
    const lobby = this.lobbies.get(roomId);
    lobby.state = LobbyState.PENDING;
    return;
  }

  removeLobby(roomId: string): void {
    const lobby = this.lobbies.get(roomId);
    this.tokenToRoom.delete(lobby.joinToken);
    this.lobbies.delete(roomId);
    return;
  }

  removeMobile(lobby: Lobby, socketId: string): void {
    const index = lobby.players.findIndex((p) => p.socketId === socketId);
    lobby.players.splice(index);
    return;
  }
}
