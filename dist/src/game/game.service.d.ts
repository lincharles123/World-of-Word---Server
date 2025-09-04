import { Game } from './interfaces/game.interface';
import { Socket } from 'socket.io';
export declare class GameService {
    private game;
    private clients;
    init(game: Game): void;
    addClient(client: Socket): void;
    removeClient(client: Socket): void;
}
