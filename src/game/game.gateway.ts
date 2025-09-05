import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';

@WebSocketGateway()
export class GameGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(GameGateway.name);

  @WebSocketServer() io: Server;

  constructor(private readonly gameService: GameService) {};

  handleConnection(client: Socket, ...args: any[]) : void {
    this.logger.log(`Client id: ${client.id} connected`);
  }

  handleDisconnect(client: Socket) : void{
    if (this.gameService.getGameClients() === client)
      this.gameService.setGameClient(null);
    else
      this.gameService.removeClient(client);
    
    this.logger.log(`Client id:${client.id} disconnected`);
  }

  @SubscribeMessage("join")
  onJoin(client: Socket, data: any) : void {
    if (data.role === 'game'){
      this.gameService.setGameClient(client);
      this.logger.log(`Game client id: ${client.id} joined`);
      return;
    }

    try {
      this.gameService.addMobileClient(client, data.username);
    } catch (e) {
      this.logger.warn(`Mobile client id: ${client.id} failed to join: ${e.message}`);
      client.emit('join-fail', e.message);
      client.disconnect();
    }
      
    client.emit('join-success', '');
    this.logger.log(`Mobile client id: ${client.id} joined as ${data.username}`);
  }
  
  @SubscribeMessage("init-game")
  init(client: Socket, data: any) : void {
    this.gameService.init(data.effect_duration, data.effect_list);
    this.logger.log(`Game initialized by client id: ${client.id}`);
  } 
  
  @SubscribeMessage("instruction")
  handleInstruction(client: Socket, data: any) : void {
    this.logger.log(`Instruction received from client id: ${client.id}`);

    let {id, name} = data;

    try {
      this.gameService.addEffect(id, name);
      this.logger.log(`Effect ${name} added`);
      client.emit('apply-success', {});
    } catch (e) {
      this.logger.warn(`Failed to add effect ${name} from client id: ${client.id}: ${e.message}`);
      client.emit('apply-fail', e.message);
    }
  }

  @SubscribeMessage("update-map")
  updateMap(client: Socket, data: any) : void {
    if (this.gameService.getGameClients() !== client) {
      this.logger.warn(`Client id: ${client.id} is not authorized to send map updates`);
      client.emit('update-map', {success: false, error: 'Not authorized'});
      return;
    }



  }
}