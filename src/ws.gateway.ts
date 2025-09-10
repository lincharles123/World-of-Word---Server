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
import { GameStartNotifyDto } from './games/dto/game-start-notify.dto';

import { LobbiesService } from './lobbies/lobbies.service';
import { CooldownService } from './admin/services/cooldown.service';
import { RateLimiterService } from './admin/services/rate-limiter.service';
import { ConnectionTrackerService } from './admin/services/connection-tracker.service';
import { LobbyState } from './lobbies/enums/lobby-state.enum';
import { GamesService } from './games/games.service';
import { GameEndNotifyDto } from './games/dto/game-end-notify.dto';
import { EventPlayerDto } from './events/players/dto/event-player.dto';
import { GameEndDto } from './games/dto/game-end.dto';
import { EventPlayerNotificationDto } from './events/players/dto/event-player-notify.dto';
import { PlayersService } from './events/players/players.service';
import { EventMusicNotificationDto } from './events/musics/dto/event-music-notify.dto';
import { MusicsService } from './events/musics/musics.service';
import { OverlayService } from './events/overlay/overlay.service';
import { PlatformsService } from './events/platforms/platforms.service';
import { EventMusicDto } from './events/musics/dto/event-music.dto';
import { EventOverlayDto } from './events/overlay/dto/event-overlay.dto';
import { EventOverlayNotificationDto } from './events/overlay/dto/event-overlay-notify.dto';
import { EventPlatformDto } from './events/platforms/dto/event-platform.dto';
import { EventPlatformNotificationDto } from './events/platforms/dto/event-platform-notify.dto';
import { LobbyPlayerDisconnectedDto } from './lobbies/dto/lobby-player-disconnected.dto';

@WebSocketGateway({ cors: { origin: '*' } })
export class WsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private readonly lobbies: LobbiesService,
    private readonly cooldownService: CooldownService,
    private readonly rateLimiterService: RateLimiterService,
    private readonly connectionTracker: ConnectionTrackerService,
    private readonly games: GamesService,
    private readonly players: PlayersService,
    private readonly music: MusicsService,
    private readonly overlay: OverlayService,
    private readonly platform: PlatformsService,
  ) {}

  static EV = {
    LOBBY_CREATE: 'lobby:create',
    LOBBY_CREATED: 'lobby:created',
    LOBBY_JOIN: 'lobby:join',
    LOBBY_JOIN_SUCCESS: 'lobby:join:success',
    LOBBY_JOIN_ERROR: 'lobby:join:error',
    LOBBY_PLAYER_JOINED: 'lobby:player:joined',
    LOBBY_PLAYER_DISCONNECTED: 'lobby:player:disconnected',
    LOBBY_DISCONNECTED: 'lobby:disconnected',
    GAME_START: 'game:start',
    GAME_START_NOTIFY: 'game:start:notify',
    GAME_END: 'game:end',
    GAME_END_NOTIFY: 'game:end:notify',
    EVENT_PLAYER: 'event:player',
    EVENT_PLAYER_NOTIFY: 'event:player:notify',
    EVENT_MUSIC: 'event:music',
    EVENT_MUSIC_NOTIFY: 'event:music:notify',
    EVENT_OVERLAY: 'event:overlay',
    EVENT_OVERLAY_NOTIFY: 'event:overlay:notify',
    EVENT_PLATFORM: 'event:platform',
    EVENT_PLATFORM_NOTIFY: 'event:platform:notify',
    EVENT_SUCCESS: 'event:success',
    EVENT_ERROR: 'event:error',
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
    const roomId = client.data.roomId;
    const lobby = this.lobbies.findByRoomId(roomId);

    if (lobby) {
      if (client.id === lobby.hostSocketId) {
        console.log(`❌ Host disconnected, closing lobby ${lobby.roomId}`);
        this.server.to(`room:${lobby.roomId}:mobiles`).emit(WsGateway.EV.LOBBY_DISCONNECTED, {});
        lobby.players.forEach(player => {
          const socket = this.server.sockets.sockets.get(player.socketId);
          socket.disconnect(true);
        });
        this.lobbies.removeLobby(roomId);
      } else {
        this.lobbies.removeMobile(lobby, client.id);
        this.server.to(lobby.hostSocketId).emit(WsGateway.EV.LOBBY_PLAYER_DISCONNECTED, new LobbyPlayerDisconnectedDto(client.data.username));
      }
    }

    console.log(`🔌 Client déconnecté: ${client.id}`);
    this.connectionTracker.removeClient(client.id);
  }

  @SubscribeMessage(WsGateway.EV.LOBBY_CREATE)
  onCreate(@MessageBody() dto: LobbyCreateDto, @ConnectedSocket() client: Socket) {
    const lobby = this.lobbies.create(dto.wsUrl, client.id, dto.maxPlayers);
    client.data.roomId = lobby.roomId;
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
    console.log(dto.token);
    const lobby = this.lobbies.findByToken(dto.token);
    if (lobby) {
      if (lobby.state && lobby.state !== LobbyState.PENDING) {
        console.log(`❌ Tentative de rejoindre un lobby non disponible: ${lobby.roomId}`);
        client.emit(WsGateway.EV.LOBBY_JOIN_ERROR, {
          message: 'Lobby already started or finished',
          code: 'LOBBY_NOT_PENDING',
        });
        return;
      }

      const player = this.lobbies.addMobile(lobby, dto.username, client.id);
      client.data.roomId = lobby.roomId;
      client.data.username = dto.username;
      client.join(`room:${lobby.roomId}`);
      client.join(`room:${lobby.roomId}:mobiles`);

      const joinSuccessPayload: LobbyJoinSuccessDto = {
        roomId: lobby.roomId,
        username: player.username,
        socketId: player.socketId,
        players: lobby.players,
      };

      this.server.to(client.id).emit(WsGateway.EV.LOBBY_JOIN_SUCCESS, joinSuccessPayload);

      const playerJoinedPayload: LobbyPlayerJoined = {
        roomId: lobby.roomId,
        username: player.username,
        socketId: player.socketId,
      };

      client.to(`room:${lobby.roomId}`).emit(WsGateway.EV.LOBBY_PLAYER_JOINED, playerJoinedPayload);
    } else {
      client.emit(WsGateway.EV.LOBBY_JOIN_ERROR, { message: 'Lobby not found', code: 'LOBBY_NOT_FOUND' });
    }
  }

  @SubscribeMessage(WsGateway.EV.GAME_START)
  onGameStart(@ConnectedSocket() client: Socket) {
    const roomId = client.data.roomId;
    const lobby = this.lobbies.findByRoomId(roomId);
    if (lobby) {
      if (lobby.state && lobby.state !== LobbyState.PENDING) {
        return;
      }
    }

    const payload = new GameStartNotifyDto(roomId);

    this.games.startGame(roomId, 'host', new Date());
    this.server.to(`room:${roomId}:mobiles`).emit(WsGateway.EV.GAME_START_NOTIFY, payload);
    this.lobbies.start(roomId);
  }

  @SubscribeMessage(WsGateway.EV.GAME_END)
  onGameEnd(@MessageBody() dto: GameEndDto, @ConnectedSocket() client: Socket) {
    const roomId = client.data.roomId;
    const lobby = this.lobbies.findByRoomId(roomId);
    if (lobby) {
      if (lobby.state && lobby.state !== LobbyState.PENDING) {
        return;
      }
    }

    const payload = new GameEndNotifyDto(roomId);

    this.games.endGame(roomId, dto.score, new Date());
    this.server.to(`room:${roomId}:mobiles`).emit(WsGateway.EV.GAME_END_NOTIFY, payload);
    this.lobbies.reset(roomId);
  }

  @SubscribeMessage(WsGateway.EV.EVENT_PLAYER)
  onEventPlayer(@MessageBody() dto: EventPlayerDto, @ConnectedSocket() client: Socket) {
    const roomId = client.data.roomId;
    const lobby = this.lobbies.findByRoomId(roomId);
    if (!lobby) {
      client.emit(WsGateway.EV.EVENT_ERROR, {
        message: 'Lobby not found',
        code: 'LOBBY_NOT_FOUND',
      });
      return;
    }

    if (lobby.state !== LobbyState.INGAME) {
      client.emit(WsGateway.EV.EVENT_ERROR, {
        message: 'Lobby is not in-game',
        code: 'LOBBY_NOT_INGAME',
      });
      return;
    }

    const word = dto.word;
    if (!word) {
      client.emit(WsGateway.EV.EVENT_ERROR, { message: 'Word is required', code: 'WORD_REQUIRED' });
      return;
    }

    const payload = new EventPlayerNotificationDto(
      client.data.username,
      word,
      this.players.getPlayerEffect(word),
    );
    this.server.to(lobby.hostSocketId).emit(WsGateway.EV.EVENT_PLAYER_NOTIFY, payload);
    client.emit(WsGateway.EV.EVENT_SUCCESS, { roomId: roomId });
    return;
  }

  @SubscribeMessage(WsGateway.EV.EVENT_MUSIC)
  onEventMusic(@MessageBody() dto: EventMusicDto, @ConnectedSocket() client: Socket) {
    const roomId = client.data.roomId;
    const lobby = this.lobbies.findByRoomId(roomId);
    if (!lobby) {
      client.emit(WsGateway.EV.EVENT_ERROR, {
        message: 'Lobby not found',
        code: 'LOBBY_NOT_FOUND',
      });
      return;
    }

    if (lobby.state !== LobbyState.INGAME) {
      client.emit(WsGateway.EV.EVENT_ERROR, {
        message: 'Lobby is not in-game',
        code: 'LOBBY_NOT_INGAME',
      });
      return;
    }

    const word = dto.word;
    if (!word) {
      client.emit(WsGateway.EV.EVENT_ERROR, { message: 'Word is required', code: 'WORD_REQUIRED' });
      return;
    }

    const payload = new EventMusicNotificationDto(
      client.data.username,
      word,
      this.music.getMusicEffect(word),
    );
    this.server.to(lobby.hostSocketId).emit(WsGateway.EV.EVENT_MUSIC_NOTIFY, payload);
    client.emit(WsGateway.EV.EVENT_SUCCESS, { roomId: roomId });
    return;
  }

  @SubscribeMessage(WsGateway.EV.EVENT_OVERLAY)
  onEventOverlay(@MessageBody() dto: EventOverlayDto, @ConnectedSocket() client: Socket) {
    const roomId = client.data.roomId;
    const lobby = this.lobbies.findByRoomId(roomId);
    if (!lobby) {
      client.emit(WsGateway.EV.EVENT_ERROR, {
        message: 'Lobby not found',
        code: 'LOBBY_NOT_FOUND',
      });
      return;
    }

    if (lobby.state !== LobbyState.INGAME) {
      client.emit(WsGateway.EV.EVENT_ERROR, {
        message: 'Lobby is not in-game',
        code: 'LOBBY_NOT_INGAME',
      });
      return;
    }

    const word = dto.word;
    if (!word) {
      client.emit(WsGateway.EV.EVENT_ERROR, { message: 'Word is required', code: 'WORD_REQUIRED' });
      return;
    }

    const payload = new EventOverlayNotificationDto(
      client.data.username,
      word,
      this.overlay.getOverlayEffect(word),
    );
    this.server.to(lobby.hostSocketId).emit(WsGateway.EV.EVENT_OVERLAY_NOTIFY, payload);
    client.emit(WsGateway.EV.EVENT_SUCCESS, { roomId: roomId });
    return;
  }

  @SubscribeMessage(WsGateway.EV.EVENT_PLATFORM)
  onEventPlatform(@MessageBody() dto: EventPlatformDto, @ConnectedSocket() client: Socket) {
    const roomId = client.data.roomId;
    const lobby = this.lobbies.findByRoomId(roomId);
    if (!lobby) {
      client.emit(WsGateway.EV.EVENT_ERROR, {
        message: 'Lobby not found',
        code: 'LOBBY_NOT_FOUND',
      });
      return;
    }

    if (lobby.state !== LobbyState.INGAME) {
      client.emit(WsGateway.EV.EVENT_ERROR, {
        message: 'Lobby is not in-game',
        code: 'LOBBY_NOT_INGAME',
      });
      return;
    }
    
    const word = dto.word;
    if (!word) {
      client.emit(WsGateway.EV.EVENT_ERROR, { message: 'Word is required', code: 'WORD_REQUIRED' });
      return;
    }

    const platform = dto.platform;
    if (!platform) {
      client.emit(WsGateway.EV.EVENT_ERROR, {
        message: 'Platform is required',
        code: 'PLATFORM_REQUIRED',
      });
      return;
    }

    const payload = new EventPlatformNotificationDto(
      client.data.username,
      word,
      this.platform.getPlatformEffect(word),
      platform,
    );
    this.server.to(lobby.hostSocketId).emit(WsGateway.EV.EVENT_PLATFORM_NOTIFY, payload);
    client.emit(WsGateway.EV.EVENT_SUCCESS, { roomId: roomId });
    return;
  }

  '--------------------------[ SECURITY ]--------------------------';

  handleMessage(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    const cooldownCheck = this.cooldownService.canSendMessage(client.id);
    if (!cooldownCheck.allowed) {
      client.emit('cooldownViolation', {
        error: 'Cooldown violation',
        reason: cooldownCheck.reason,
        remainingCooldown: cooldownCheck.remainingCooldown,
        timestamp: new Date().toISOString(),
      });
      return;
    }
  }

  handleSpam(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    const cooldownCheck = this.cooldownService.canSendMessage(client.id);
    const rateLimitCheck = this.rateLimiterService.canSendMessage(
      client.id,
      this.getClientIP(client),
    );

    if (!cooldownCheck.allowed) {
      client.emit('cooldownViolation', {
        error: 'Cooldown violation',
        reason: cooldownCheck.reason,
        remainingCooldown: cooldownCheck.remainingCooldown,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (!rateLimitCheck.allowed) {
      client.emit('rateLimitExceeded', {
        error: 'Rate limit exceeded',
        reason: rateLimitCheck.reason,
        retryAfter: rateLimitCheck.retryAfter,
        timestamp: new Date().toISOString(),
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
