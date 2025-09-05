import { Injectable } from '@nestjs/common';
import { Game } from './interfaces/game.interface';
import { Socket } from 'socket.io';

type Effect = {
    type: string;
    start: Date;
}

@Injectable()
export class GameService {
    private game: Record<string, Effect[]>;
    private clients: Record<string, Socket> = {};
    private readonly maxClients = 1;
    private gameClient: Socket;
    private effect_duration: number;
    private effect_list: string[];

    init(effect_duration: number, list: string) : void {
        this.effect_duration = effect_duration;
        this.effect_list = list.split(',');
    }

    updateMap(element: JSON[]) {

    }

    addMobileClient(client: Socket, username: string) {
        if (Object.keys(this.clients).length === this.maxClients)
            throw new Error('Max clients reached');
        if (username in this.clients)
            throw new Error(`Username: ${username} already taken`);
        this.clients[username] = client;
    }

    removeClient(client: Socket) : void {
        delete this.clients[client.id];
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

    addEffect(id: string, name: string) {
        if (!this.effect_list.includes(name))
            throw new Error(`Invalid word: ${name}`);

        if (!(id in this.game))
            this.game[id] = [{type: name, start: new Date()}];
        else
            this.game[id].push({type: name, start: new Date()});
    }
}
