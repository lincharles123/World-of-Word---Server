import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { GameService } from './game.service';
export declare class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly gameService;
    private readonly logger;
    io: Server;
    constructor(gameService: GameService);
    handleConnection(client: any, ...args: any[]): void;
    handleDisconnect(client: any): void;
    handleAction(client: any, data: any): {
        event: string;
        data: string;
    };
}
