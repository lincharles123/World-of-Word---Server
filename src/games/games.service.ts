import { Injectable } from '@nestjs/common';

@Injectable()
export class GamesService {
  startGame(roomId: string, username: string, startDate: Date): void {
    console.log(`🚀 Jeu lancé dans le lobby: ${roomId}`);
  }

  endGame(roomId: string, score: number, endDate: Date): void {
    console.log(`🏁 Jeu terminé dans le lobby: ${roomId} avec un score de ${score}`);
  }
}
