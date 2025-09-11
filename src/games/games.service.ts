import { Injectable } from '@nestjs/common';
import { Game } from './types';

@Injectable()
export class GamesService {
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

  endGame(roomId: string, score: number, endDate: Date): void {
    const game = this.games.get(roomId);
    if (game) {
      game.endDate = endDate;
      game.score = score;
      this.games.set(roomId, game);
    }

    // To do: save the game to database for leaderboard, etc.
    this.games.delete(roomId);

    console.log(`🏁 Jeu terminé dans le lobby: ${roomId} avec un score de ${score}`);
  }

  addPlatform(roomId: string, id: string): void {
    const game = this.games.get(roomId);
    if (game) {
      game.map.set(id, {});
      console.log(`➕ Plateforme ajoutée: ${id} dans le jeu du lobby: ${roomId}`);
    }
  }

  removePlatform(roomId: string, id: string): void {
    const game = this.games.get(roomId);
    if (game) {
      game.map.delete(id);
      console.log(`➖ Plateforme supprimée: ${id} du jeu du lobby: ${roomId}`);
    }
  }
}
