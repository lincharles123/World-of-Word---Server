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
import { RateLimiterService } from './anti-spam/rate-limiter.service';
import { CooldownService } from './anti-spam/cooldown.service';
import { AntiSpamProtection, CooldownProtection } from './anti-spam/anti-spam.decorator';

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
  ) {}

  @AntiSpamProtection()
  handleConnection(client: Socket, ...args: any[]): void {
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

    this.logger.log(`Client id: ${client.id} connected from IP: ${clientIP}`);
    client.emit('welcome', {
      message: 'Connexion réussie au serveur de jeu',
      clientId: client.id,
      timestamp: new Date().toISOString()
    });
  }

  handleDisconnect(client: Socket): void {
    if (this.gameService.getGameClients() === client) {
      this.gameService.setGameClient(null);
      this.logger.log(`Game client id: ${client.id} disconnected`);
    } else {
      this.gameService.removeClient(client);
      this.logger.log(`Client id: ${client.id} disconnected`);
      this.gameService.broadcastMessage('playerLeft', {
        message: `Un joueur s'est déconnecté`,
        leftPlayerId: client.id,
        totalPlayers: this.gameService.getClientCount()
      });
    }
  }

  private getClientIP(client: Socket): string {
    const forwarded = client.handshake?.headers['x-forwarded-for'];
    const real = client.handshake?.headers['x-real-ip'];
    const direct = client.handshake?.address;
    
    if (forwarded) {
      if (typeof forwarded === 'string') {
        return forwarded.split(',')[0].trim();
      } else if (Array.isArray(forwarded)) {
        return forwarded[0].trim();
      }
    }
    
    if (real) {
      if (typeof real === 'string') {
        return real;
      } else if (Array.isArray(real)) {
        return real[0].trim();
      }
    }
    
    if (direct) {
      return direct;
    }
    return client.conn?.remoteAddress || 'unknown';
  }

  @SubscribeMessage("join")
  onJoin(client: Socket, data: any): void {
    if (data.role === 'game') {
      this.gameService.setGameClient(client);
      this.logger.log(`Game client id: ${client.id} joined`);
      return;
    }

    try {
      this.gameService.addMobileClient(client, data.username);
      client.emit('join-success', '');
      this.logger.log(`Mobile client id: ${client.id} joined as ${data.username}`);
      
      this.gameService.broadcastMessage('playerJoined', {
        message: `Un nouveau joueur s'est connecté`,
        newPlayerId: client.id,
        totalPlayers: this.gameService.getClientCount()
      });
    } catch (e) {
      this.logger.warn(`Mobile client id: ${client.id} failed to join: ${e.message}`);
      client.emit('join-fail', e.message);
      client.disconnect();
    }
  }
  
  @SubscribeMessage("init-game")
  init(client: Socket, data: any): void {
    this.gameService.init(data.effect_duration, data.effect_list);
    this.logger.log(`Game initialized by client id: ${client.id}`);
  }
  
  @SubscribeMessage("instruction")
  handleAction(client: Socket, data: any) {
    this.logger.log(`Instruction received from client id: ${client.id}`);
    this.logger.debug(`Payload: ${JSON.stringify(data)}`);

    const { id, name } = data;

    try {
      this.gameService.addEffect(id, name);
      this.logger.log(`Effect ${name} added`);
      client.emit('apply-success', {});
      this.gameService.getGameClients().emit('apply-effect', {
        username: this.gameService.getUsernameByClient(client),
        id: id,
        type: name
      });
    } catch (e) {
      this.logger.warn(`Failed to add effect ${name} from client id: ${client.id}: ${e.message}`);
      client.emit('apply-fail', e.message);
    }
  }

  @AntiSpamProtection()
  @SubscribeMessage("testMessage")
  handleTestMessage(client: Socket, data: any) {
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
  handleGetStatus(client: Socket, data: any) {
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
  handleQuickMessage(client: Socket, data: any) {
    this.logger.log(`Quick message from client id: ${client.id}`);
    
    client.emit('quickResponse', {
      message: 'Message rapide reçu !',
      cooldownStatus: this.cooldownService.getCooldownStats(client.id),
      timestamp: new Date().toISOString()
    });
  }

  @SubscribeMessage("getCooldownStatus")
  handleGetCooldownStatus(client: Socket, data: any) {
    const stats = this.cooldownService.getCooldownStats(client.id);
    
    client.emit('cooldownStatusResponse', {
      clientId: client.id,
      cooldownStats: stats,
      config: this.cooldownService.getConfig(),
      timestamp: new Date().toISOString()
    });
  }
}