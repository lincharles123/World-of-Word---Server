import { Injectable } from '@nestjs/common';
import { Game } from './types';
import { GameDataService } from 'src/entities/games/game_data.service';
import { CreateGameDto } from 'src/entities/games/dto/game_create.dto';
import { Lobby } from 'src/lobbies/types';

@Injectable()
export class GamesService {
  constructor(
      private readonly dataService: GameDataService,
    ) {}
  private games: Map<string, Game> = new Map();

  startGame(roomId: string, username: string, startDate: Date): void {
    const newGame: Game = {
      roomId,
      username,
      startDate,
      map: new Map<string, any>(),
    };
    this.games.set(roomId, newGame);

    console.log(`🚀 Jeu démarré dans le lobby: ${roomId} pour l'utilisateur: ${username}`);
  }

  endGame(lobby: Lobby, score: number, endDate: Date): void {
    const roomId = lobby.roomId
    const game = this.games.get(roomId);
    const payload: CreateGameDto = {
      username: game.username,
      score: score,
      mobilePlayerNumber: lobby.players.length,
      time: endDate.getTime() - game.startDate.getTime()
    }

    this.dataService.create(payload)
    this.games.delete(roomId);

    console.log(`🏁 Jeu terminé dans le lobby: ${roomId} avec un score de ${score}`);
  }

  addPlatform(roomId: string, id: string, x: number, y: number): void {
    const game = this.games.get(roomId);

    if (game) {
      if (game.map.has(id)) {
        game.map.get(id).platforms.push({ x, y });
      } else {
        game.map.set(id, { platforms: [{ x, y }], effect: [] });
      }
      console.log(`➕ Plateforme ajoutée: ${id} dans le jeu du lobby: ${roomId}`);
    }
  }

  removePlatform(roomId: string, id: string): void {
    const game = this.games.get(roomId);

    if (game) {
      let map = game.map;
      map.get(id).platforms.shift();
      if (map.get(id).platforms.length === 0) map.delete(id);
      console.log(`➖ Plateforme supprimée: ${id} du jeu du lobby: ${roomId}`);
    }
  }

  addEffectToPlatform(roomId: string, id: string, effect: string): void {
    const game = this.games.get(roomId);
    if (game) {
      if (game.map.has(id)) {
        game.map.get(id).effect.push(effect);
        setTimeout(() => {
          if (game.map.has(id)) {
            game.map.get(id).effect.shift();
            console.log(
              `🧹 Effet supprimé: ${effect} de la plateforme: ${id} dans le jeu du lobby: ${roomId}`,
            );
          }
        }, 5000);

        console.log(
          `✨ Effet ajouté: ${effect} à la plateforme: ${id} dans le jeu du lobby: ${roomId}`,
        );
      }
    }
  }
}
