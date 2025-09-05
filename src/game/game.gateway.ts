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
import { RateLimiterService } from './rate-limiter.service';
import { CooldownService } from './cooldown.service';
import { AntiSpamProtection, CooldownProtection } from './anti-spam.decorator';

@WebSocketGateway()
export class GameGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(GameGateway.name);

  @WebSocketServer() io: Server;

  constructor(
    private readonly gameService: GameService,
    private readonly rateLimiterService: RateLimiterService,
    private readonly cooldownService: CooldownService
  ) {};

  handleConnection(client: any, ...args: any[]) {
    const clientIP = this.getClientIP(client);
    const connectionCheck = this.rateLimiterService.canConnect(clientIP);
    if (!connectionCheck.allowed) {
      this.logger.warn(
        `Connection rate limit exceeded for IP ${clientIP}. ` +
        `Retry after: ${connectionCheck.retryAfter}s`
      );
      
      client.emit('connectionRateLimitExceeded', {
        error: 'Too many connections',
        reason: connectionCheck.reason,
        retryAfter: connectionCheck.retryAfter,
        timestamp: new Date().toISOString()
      });
      setTimeout(() => client.disconnect(true), 1000);
      return;
    }

    this.gameService.addClient(client);
    this.logger.log(`Client id: ${client.id} connected from IP: ${clientIP}`);
    client.emit('welcome', {
      message: 'Connexion réussie au serveur de jeu',
      clientId: client.id,
      timestamp: new Date().toISOString()
    });
    this.gameService.broadcastMessage('playerJoined', {
      message: `Un nouveau joueur s'est connecté`,
      newPlayerId: client.id,
      totalPlayers: this.gameService.getClientCount()
    });
  }

  handleDisconnect(client: any) {
    this.gameService.removeClient(client);
    this.logger.log(`Client id: ${client.id} disconnected`);
    this.gameService.broadcastMessage('playerLeft', {
      message: `Un joueur s'est déconnecté`,
      leftPlayerId: client.id,
      totalPlayers: this.gameService.getClientCount()
    });
  }

  private getClientIP(client: any): string {
    const forwarded = client.handshake?.headers['x-forwarded-for'];
    const real = client.handshake?.headers['x-real-ip'];
    const direct = client.handshake?.address;
    
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    if (real) {
      return real;
    }
    
    if (direct) {
      return direct;
    }
    return client.conn?.remoteAddress || 'unknown';
  }

  @AntiSpamProtection()
  @SubscribeMessage("instruction")
  handleAction(client: any, data: any) {
    this.logger.log(`Instruction received from client id: ${client.id}`);
    this.logger.debug(`Payload: ${JSON.stringify(data)}`);
    const response = {
      event: "instructionResponse",
      data: {
        message: `Instruction reçue et traitée`,
        originalData: data,
        timestamp: new Date().toISOString(),
        processedBy: client.id
      },
    };
    return response;
  }

  @AntiSpamProtection()
  @SubscribeMessage("testMessage")
  handleTestMessage(client: any, data: any) {
    this.logger.log(`Test message received from client id: ${client.id}`);
    this.logger.debug(`Test payload: ${JSON.stringify(data)}`);
    
    client.emit('testResponse', {
      message: 'Votre message de test a été reçu !',
      receivedData: data,
      timestamp: new Date().toISOString()
    });
    
    this.gameService.broadcastMessage('testBroadcast', {
      message: `Le client ${client.id} a envoyé un message de test`,
      data: data,
      timestamp: new Date().toISOString()
    });
  }

  @CooldownProtection()
  @SubscribeMessage("getStatus")
  handleGetStatus(client: any, data: any) {
    this.logger.log(`Status request from client id: ${client.id}`);
    
    return {
      event: "statusResponse",
      data: {
        connectedClients: this.gameService.getClientCount(),
        clientIds: this.gameService.getConnectedClients(),
        serverTime: new Date().toISOString(),
        yourId: client.id
      }
    };
  }

  @CooldownProtection()
  @SubscribeMessage("quickMessage")
  handleQuickMessage(client: any, data: any) {
    this.logger.log(`Quick message from client id: ${client.id}`);
    
    client.emit('quickResponse', {
      message: 'Message rapide reçu !',
      cooldownStatus: this.cooldownService.getCooldownStats(client.id),
      timestamp: new Date().toISOString()
    });
  }

  @SubscribeMessage("getCooldownStatus")
  handleGetCooldownStatus(client: any, data: any) {
    const stats = this.cooldownService.getCooldownStats(client.id);
    
    client.emit('cooldownStatusResponse', {
      clientId: client.id,
      cooldownStats: stats,
      config: this.cooldownService.getConfig(),
      timestamp: new Date().toISOString()
    });
  }
}