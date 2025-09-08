import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { LobbyCreateDto } from './lobbies/dto/lobby-create.dto';
import { LobbyCreatedDto, QrPayloadDto } from './lobbies/dto/lobby-created.dto';
import { LobbyJoinSuccessDto } from './lobbies/dto/lobby-join-success.dto';
import { LobbyJoinDto } from './lobbies/dto/lobby-join.dto';
import { LobbyPlayerJoined } from './lobbies/dto/lobby-player-joined.dto';

import { LobbiesService } from './lobbies/lobbies.service';
import { CooldownService } from './admin/services/cooldown.service';
import { RateLimiterService } from './admin/services/rate-limiter.service';
import { ConnectionTrackerService } from './admin/services/connection-tracker.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class WsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private readonly lobbies: LobbiesService,
    private readonly cooldownService: CooldownService,
    private readonly rateLimiterService: RateLimiterService,
    private readonly connectionTracker: ConnectionTrackerService,
  ) {}

  static EV = {
    LOBBY_CREATE: 'lobby:create',
    LOBBY_CREATED: 'lobby:created',
    LOBBY_JOIN: 'lobby:join',
    LOBBY_JOIN_SUCCESS: 'lobby:join-success',
    LOBBY_PLAYER_JOINED: 'lobby:player-joined'
  } as const;

  handleConnection(client: Socket) {
    console.log(`🔌 Nouveau client connecté: ${client.id}`);
    
    const ip = this.getClientIP(client);
    const userAgent = client.handshake.headers['user-agent'];
    this.connectionTracker.addClient(client.id, ip, userAgent);

    client.onAny((event, ...args) => {
      console.log(`📡 Event reçu [${event}] du client ${client.id}:`, args);
      this.connectionTracker.updateActivity(client.id);
    });
  }

  handleDisconnect(client: Socket) {
    console.log(`🔌 Client déconnecté: ${client.id}`);
    this.connectionTracker.removeClient(client.id);
  }

  @SubscribeMessage(WsGateway.EV.LOBBY_CREATE)
  onCreate(@MessageBody() dto: LobbyCreateDto, @ConnectedSocket() client: Socket) {
    const lobby = this.lobbies.create(dto.wsUrl, client.id, dto.maxPlayers);

    client.join(`room:${lobby.roomId}`);

    const payload: LobbyCreatedDto = {
      roomId: lobby.roomId,
      maxPlayers: lobby.maxPlayers,
      qrPayload: {
        v: 1,
        wsUrl: lobby.wsUrl,
        roomId: lobby.roomId,
        joinToken: lobby.joinToken,
      } as QrPayloadDto,
    };

    this.server.to(lobby.hostSocketId).emit(WsGateway.EV.LOBBY_CREATED, payload);
  }

  @SubscribeMessage(WsGateway.EV.LOBBY_JOIN)
  onJoin(@MessageBody() dto: LobbyJoinDto, @ConnectedSocket() client: Socket) {
    console.log(dto.token)
    const lobby = this.lobbies.findByToken(dto.token);

    if (lobby) {
      const player = this.lobbies.addMobile(lobby, dto.username, client.id);

      client.join(`room:${lobby.roomId}`);
      client.join(`room:${lobby.roomId}:mobiles`);

      const payload: LobbyJoinSuccessDto | LobbyPlayerJoined = {
        roomId: lobby.roomId,
        username: player.username,
        socketId: player.socketId,
      };

      this.server.to(client.id).emit(WsGateway.EV.LOBBY_JOIN_SUCCESS, payload);

      client.to(`room:${lobby.roomId}`).emit(WsGateway.EV.LOBBY_PLAYER_JOINED, payload);
    } else {
      client.emit('error', { message: 'Lobby not found' });
    }
  }

  "--------------------------[ SECURITY ]--------------------------"

  handleMessage(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    const cooldownCheck = this.cooldownService.canSendMessage(client.id);
    if (!cooldownCheck.allowed) {
      client.emit('cooldownViolation', {
        error: 'Cooldown violation',
        reason: cooldownCheck.reason,
        remainingCooldown: cooldownCheck.remainingCooldown,
        timestamp: new Date().toISOString()
      });
      return;
    }
  }

  handleSpam(@MessageBody() data: any, @ConnectedSocket() client: Socket) {    
    const cooldownCheck = this.cooldownService.canSendMessage(client.id);
    const rateLimitCheck = this.rateLimiterService.canSendMessage(client.id, this.getClientIP(client));
    
    if (!cooldownCheck.allowed) {
      client.emit('cooldownViolation', {
        error: 'Cooldown violation',
        reason: cooldownCheck.reason,
        remainingCooldown: cooldownCheck.remainingCooldown,
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    if (!rateLimitCheck.allowed) {
      client.emit('rateLimitExceeded', {
        error: 'Rate limit exceeded',
        reason: rateLimitCheck.reason,
        retryAfter: rateLimitCheck.retryAfter,
        timestamp: new Date().toISOString()
      });
      return;
    }
  }
  
  private getClientIP(client: Socket): string {
    const forwarded = client.handshake?.headers['x-forwarded-for'];
    const real = client.handshake?.headers['x-real-ip'];
    const direct = client.handshake?.address;
    
    if (forwarded) {
      return Array.isArray(forwarded) ? forwarded[0].trim() : forwarded.split(',')[0].trim();
    }
    
    if (real) {
      return Array.isArray(real) ? real[0].trim() : real;
    }
    
    if (direct) {
      return direct;
    }
    
    return client.conn?.remoteAddress || 'unknown';
  }
}