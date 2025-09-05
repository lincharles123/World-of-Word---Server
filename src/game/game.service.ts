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
    private gameClient: Socket;
    private effect_duration: number;
    private effect_list: string[];

    init(effect_duration: number, list: string) : void {
        this.effect_duration = effect_duration;
        this.effect_list = list.split(',');
    }

    updateMap(element: JSON[]) {

    }

    addMobileClient(client: Socket, username: string) : boolean {
        // Limit to 2 mobile clients
        if (Object.keys(this.clients).length > 2)
            return false;

        this.clients[username] = client;
        return true;
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

    addEffect(client: Socket, id: string, type: string) {
        if (!(id in this.game))
            this.game[id] = [{type: type, start: new Date()}];
        else
            this.game[id].push({type: type, start: new Date()});
    }
}
