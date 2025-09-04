import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server } from 'socket.io';
import { GameService } from './game.service';

@WebSocketGateway()
export class GameGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(GameGateway.name);

  @WebSocketServer() io: Server;

  constructor(private readonly gameService: GameService) {};

  handleConnection(client: any, ...args: any[]) {
    this.gameService.addClient(client);
    this.logger.log(`Client id: ${client.id} connected`);
    console.log('connected');
  }

  handleDisconnect(client: any) {
    this.gameService.removeClient(client);
    this.logger.log(`Client id:${client.id} disconnected`);
  }

  @SubscribeMessage("instruction")
  handleAction(client: any, data: any) {
    this.logger.log(`Instruction received from client id: ${client.id}`);
    this.logger.debug(`Payload: ${data}`);
    return {
      event: "",
      data: "",
    };
  }
}