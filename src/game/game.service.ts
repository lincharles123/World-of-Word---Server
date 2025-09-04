import { Injectable } from '@nestjs/common';
import { Game } from './interfaces/game.interface';
import { Socket } from 'socket.io';

@Injectable()
export class GameService {
    private game: Game;
    private clients: Record<string, Socket> = {};

    init(game: Game) {
        this.game = game;
    }

    addClient(client: Socket) {
        this.clients[client.id] = client;
    }

    removeClient(client: Socket) {
        delete this.clients[client.id];
    }
}
