import { Injectable } from '@nestjs/common';
import { GameElement } from './interfaces/game.interface';
import { Socket } from 'socket.io';

@Injectable()
export class GameService {
    private gameState: Record<string, GameElement>;
    private clients: Record<string, Socket> = {};
    private readonly maxClients = 1;
    private gameClient: Socket;
    private effect_duration: number;
    private effect_list: string[];

    init(effect_duration: number, list: string) : void {
        this.effect_duration = effect_duration;
        this.effect_list = list.split(',');
    }

    updateGameState(element: JSON[]) {
        element.forEach((el: any) => {
            this.gameState[el.id] = {type: el.type, isInterractive: el.isInteractive, effects: []};
        });
    }

    addMobileClient(client: Socket, username: string) {
        if (Object.keys(this.clients).length === this.maxClients)
            throw new Error('Max clients reached');
        if (username in this.clients)
            throw new Error(`Username: ${username} already taken`);

        this.clients[username] = client;
    }

    removeClient(client: Socket) : void {
        delete this.clients[Object.keys(this.clients).find(key => this.clients[key] === client)];
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

    setGameClient(client: Socket) : void {
        this.gameClient = client;
    }

    getGameClients() : Socket {
        return this.gameClient;
    }

    getMobileClients() : Record<string, Socket> {
        return this.clients;
    }

    getUsernameByClient(client: Socket) : string {
        return Object.keys(this.clients).find(key => this.clients[key] === client);
    }

    addEffect(id: string, name: string) {
        if (!this.effect_list.includes(name))
            throw new Error(`Invalid word: ${name}`);

        this.gameState[id].effects.push({type: name, start: new Date()});
    }
}
