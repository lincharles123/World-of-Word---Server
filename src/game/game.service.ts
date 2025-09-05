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

    sendMessageToClient(clientId: string, event: string, data: any) {
        const client = this.clients[clientId];
        if (client) {
            client.emit(event, data);
        }
    }

    broadcastMessage(event: string, data: any) {
        Object.values(this.clients).forEach(client => {
            client.emit(event, data);
        });
    }

    getConnectedClients() {
        return Object.keys(this.clients);
    }

    getClientCount() {
        return Object.keys(this.clients).length;
    }
}
