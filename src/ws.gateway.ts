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
import { GameEndDto } from './games/dto/game-end.dto';
import { PlatformsService } from './events/platforms/platforms.service';
import { EventPlatformNotifyDto } from './events/platforms/dto/event-platform-notify.dto';
import { LobbyPlayerDisconnectedDto } from './lobbies/dto/lobby-player-disconnected.dto';
import { LobbyActor } from './lobbies/enums/lobby-actor.enum';
import { LobbyClosedDto } from './lobbies/dto/lobby-closed.dto';
import { GamePlatformAddDto } from './games/dto/game-platfom-add.dto';
import { Lobby } from './lobbies/types';
import { GamePlatformAddNotifyDto } from './games/dto/game-platfom-add-notify.dto';
import { GamePlatformRemoveDto } from './games/dto/game-platfom-remove.dto';
import { GamePlatformRemoveNotifyDto } from './games/dto/game-platfom-remove-notify.dto';
import { effectMap } from './events/effect-map';
import { EventService } from './events/event.service';
import { EventGlobalDto } from './events/dto/event-global.dto';
import { EventPlatformDto } from './events/platforms/dto/event-platform.dto';
import { WordHistory } from './games/types';

@WebSocketGateway({ cors: { origin: '*' } })
export class WsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private readonly lobbies: LobbiesService,
    private readonly cooldownService: CooldownService,
    private readonly rateLimiterService: RateLimiterService,
    private readonly connectionTracker: ConnectionTrackerService,
    private readonly games: GamesService,
    private readonly platform: PlatformsService,
    private readonly event: EventService,
  ) {}

  static EV = {
    LOBBY_CREATE: 'lobby:create',
    LOBBY_CREATED: 'lobby:created',
    LOBBY_JOIN: 'lobby:join',
    LOBBY_JOIN_SUCCESS: 'lobby:join:success',
    LOBBY_JOIN_ERROR: 'lobby:join:error',
    LOBBY_PLAYER_JOINED: 'lobby:player:joined',
    LOBBY_PLAYER_DISCONNECTED: 'lobby:player:disconnected',
    LOBBY_CLOSED: 'lobby:closed',
    GAME_START: 'game:start',
    GAME_START_NOTIFY: 'game:start:notify',
    GAME_END: 'game:end',
    GAME_END_NOTIFY: 'game:end:notify',
    GAME_PLATFORM_ADD: 'game:platform:add',
    GAME_PLATFORM_ADD_NOTIFY: 'game:platform:add:notify',
    GAME_PLATFORM_REMOVE: 'game:platform:remove',
    GAME_PLATFORM_REMOVE_NOTIFY: 'game:platform:remove:notify',
    GAME_WORD: 'game:word',
    GAME_WORD_NOTIFY: 'game:word:notify',
    EVENT_GLOBAL: 'event:add',
    EVENT_PLAYER_NOTIFY: 'event:player:notify',
    EVENT_MUSIC_NOTIFY: 'event:music:notify',
    EVENT_OVERLAY_NOTIFY: 'event:overlay:notify',
    EVENT_PLATFORM: 'event:add:platform',
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

  async handleDisconnect(client: Socket) {
    const roomId = client.data.roomId as string | undefined;
    const lobby = this.lobbies.findByRoomId(roomId);

    if (lobby) {
      const actor = client.id === lobby.hostSocketId ? LobbyActor.PC : LobbyActor.MOBILE;

      const payload: LobbyPlayerDisconnectedDto = {
        username: client.data.username,
        actor,
      };

      this.server.to(`room:${lobby.roomId}`).emit(WsGateway.EV.LOBBY_PLAYER_DISCONNECTED, payload);

      if (actor === LobbyActor.PC) {
        const payload: LobbyClosedDto = {
          roomId: lobby.roomId,
          reason: 'host_disconnected',
        };

        this.server.to(`room:${lobby.roomId}:mobiles`).emit(WsGateway.EV.LOBBY_CLOSED, payload);

        const sockets = await this.server.in(`room:${lobby.roomId}:mobiles`).fetchSockets();
        for (const s of sockets) {
          s.leave(`room:${lobby.roomId}`);
          s.leave(`room:${lobby.roomId}:mobiles`);
          s.data.roomId = undefined;
          s.data.username = undefined;
        }

        this.lobbies.removeLobby(lobby.roomId);
      } else {
        this.lobbies.removeMobile(lobby, client.id);
      }
    }

    this.connectionTracker.removeClient(client.id);
  }

  @SubscribeMessage(WsGateway.EV.LOBBY_CREATE)
  onCreate(@MessageBody() dto: LobbyCreateDto, @ConnectedSocket() client: Socket) {
    const lobby = this.lobbies.create(dto.wsUrl, client.id, dto.maxPlayers);
    client.data.roomId = lobby.roomId;
    client.data.username = dto.username;
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

      if(lobby.maxPlayers === lobby.players.length) {
        console.log(`❌ Le lobby ${lobby.roomId} est plein`)

        client.emit(WsGateway.EV.LOBBY_JOIN_ERROR, {
          message: 'Lobby is Full',
          code: 'LOBBY_FULL',
        });

        return;
      }

      if(lobby.players.find((player) => player.username === dto.username)){
        console.log(`❌ L'utilisateur ${dto.username} existe dans le lobby ${lobby.roomId}`)

        client.emit(WsGateway.EV.LOBBY_JOIN_ERROR, {
          message: 'Username already exists',
          code: 'USERNAME_ALREADY_EXIST',
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
        avatar: dto.avatar
      };

      client.to(`room:${lobby.roomId}`).emit(WsGateway.EV.LOBBY_PLAYER_JOINED, playerJoinedPayload);
    } else {
      client.emit(WsGateway.EV.LOBBY_JOIN_ERROR, {
        message: 'Lobby not found',
        code: 'LOBBY_NOT_FOUND',
      });
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

    const payload: GameStartNotifyDto = {
      roomId: roomId,
    };

    this.games.startGame(roomId, client.data.username, new Date());

    const words = Object.keys(effectMap);
    const wordTypes = words.map(word => {
      let types = effectMap[word]?.type;
      if (!types) {
        throw new Error('No type found for word: ' + word);
      }
      const mappedTypes = types.map(t => {
        if (t === 'event:player' || t === 'event:music' || t === 'event:overlay') {
          return t;
        } else if (t === 'event:platform') {
          return t;
        } else {
          return t;
        }
      });
      const uniqueTypes = Array.from(new Set(mappedTypes));
      return { word, types: uniqueTypes };
    });

    this.server.to(`room:${roomId}:mobiles`).emit(WsGateway.EV.GAME_WORD, { wordTypes });

    this.server.to(`room:${roomId}:mobiles`).emit(WsGateway.EV.GAME_START_NOTIFY, payload);

    this.lobbies.start(roomId);
    return;
  }

  @SubscribeMessage(WsGateway.EV.GAME_END)
  onGameEnd(@MessageBody() dto: GameEndDto, @ConnectedSocket() client: Socket) {
    const roomId = client.data.roomId;
    const lobby: Lobby = this.lobbies.findByRoomId(roomId);

    if (lobby) {
      if (lobby.state && lobby.state !== LobbyState.INGAME) {
        return;
      }
    }

    const payload: GameEndNotifyDto = {
      roomId: roomId,
    };

    this.games.endGame(lobby, dto.score, new Date());

    this.server.to(`room:${roomId}:mobiles`).emit(WsGateway.EV.GAME_END_NOTIFY, payload);

    this.lobbies.reset(roomId);
  }

  lobbyInGameCheck(roomId: string, client: Socket): Lobby | undefined {
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

    return lobby;
  }

  @SubscribeMessage(WsGateway.EV.EVENT_GLOBAL)
  onEventGlobal(@MessageBody() dto: EventGlobalDto, @ConnectedSocket() client: Socket) {
    const roomId = client.data.roomId;
    const lobby = this.lobbyInGameCheck(roomId, client);

    if (!lobby) return;

    const word = dto.word;

    if (!word) {
      client.emit(WsGateway.EV.EVENT_ERROR, {
        message: 'Word is required',
        code: 'WORD_REQUIRED',
      });

      return;
    }
    console.log('dto received:', dto);
    if(!dto.type) {
      client.emit(WsGateway.EV.EVENT_ERROR, {
        message: 'Type is required',
        code: 'TYPE_REQUIRED',
      });

      return;
    }
    const game = this.games.findByRoomId(roomId);
    const payload = this.event.getPayload(word,  client.data.username, dto.type);
    console.log('Payload generated:', payload);
    for (const [key, value] of payload) {
      if (key === 'event:player') {
        this.server.to(lobby.hostSocketId).emit(WsGateway.EV.EVENT_PLAYER_NOTIFY, value);
        game.wordHistory.push({ username: client.data.username, word: word, date: new Date() });
        this.emitGameWordNotify(roomId, game.wordHistory);
      } else if (key === 'event:music') {
        this.server.to(lobby.hostSocketId).emit(WsGateway.EV.EVENT_MUSIC_NOTIFY, value);
        game.wordHistory.push({ username: client.data.username, word: word, date: new Date() });
        this.emitGameWordNotify(roomId, game.wordHistory);
      } else if (key === 'event:overlay') {
        this.server.to(lobby.hostSocketId).emit(WsGateway.EV.EVENT_OVERLAY_NOTIFY, value);
        game.wordHistory.push({ username: client.data.username, word: word, date: new Date() });
        this.emitGameWordNotify(roomId, game.wordHistory);
      } else {
        client.emit(WsGateway.EV.EVENT_ERROR, {
          message: 'Unknown payload key',
          code: 'UNKNOWN_PAYLOAD_KEY',
        });
      }
    }
    
    client.emit(WsGateway.EV.EVENT_SUCCESS, { roomId: roomId });
    return;
  }

  emitGameWordNotify(roomId: string, wordHistory: WordHistory[]) {
    this.server.to(`room:${roomId}:mobiles`).emit(WsGateway.EV.GAME_WORD_NOTIFY, wordHistory);
  }

  @SubscribeMessage(WsGateway.EV.EVENT_PLATFORM)
  onEventPlatform(@MessageBody() dto: EventPlatformDto, @ConnectedSocket() client: Socket) {
    const roomId = client.data.roomId;
    const lobby = this.lobbyInGameCheck(roomId, client);

    if (!lobby) return;

    const word = dto.word;

    if (!word) {
      client.emit(WsGateway.EV.EVENT_ERROR, {
        message: 'Word is required',
        code: 'WORD_REQUIRED',
      });

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

    this.games.addEffectToPlatform(roomId, platform, this.platform.getPlatformEffect(word));

    const game = this.games.findByRoomId(roomId);

    const payload: EventPlatformNotifyDto = {
      "username": client.data.username,
      "word": word,
      "effect": this.platform.getPlatformEffect(word),
      "platform": platform,
    };
    

    this.server.to(lobby.hostSocketId).emit(WsGateway.EV.EVENT_PLATFORM_NOTIFY, payload);
    game.wordHistory.push({ username: client.data.username, word: word, date: new Date() });
    this.emitGameWordNotify(roomId, game.wordHistory);

    client.emit(WsGateway.EV.EVENT_SUCCESS, { roomId: roomId });

    return;
  }

  @SubscribeMessage(WsGateway.EV.GAME_PLATFORM_ADD)
  onGamePlatformAdd(@MessageBody() dto: GamePlatformAddDto, @ConnectedSocket() client: Socket) {
    const roomId = client.data.roomId;
    const lobby = this.lobbies.findByRoomId(roomId);

    if (lobby) {
      if (lobby.state && lobby.state !== LobbyState.INGAME) {
        return;
      }
    }

    this.games.addPlatform(roomId, dto.id, dto.x, dto.y, dto.width);

    console.log(`Adding platform ${dto.id} in room ${roomId}`);

    const payload: GamePlatformAddNotifyDto = {
      roomId: roomId,
      id: dto.id,
      x: dto.x,
      y: dto.y,
      width: dto.width,
    };

    this.server.to(`room:${roomId}:mobiles`).emit(WsGateway.EV.GAME_PLATFORM_ADD_NOTIFY, payload);

    return;
  }

  @SubscribeMessage(WsGateway.EV.GAME_PLATFORM_REMOVE)
  onGamePlatformRemove(
    @MessageBody() dto: GamePlatformRemoveDto,
    @ConnectedSocket() client: Socket,
  ) {
    const roomId = client.data.roomId;
    const lobby = this.lobbies.findByRoomId(roomId);

    if (lobby) {
      if (lobby.state && lobby.state !== LobbyState.INGAME) {
        return;
      }
    }

    this.games.removePlatform(roomId, dto.id);

    console.log(`Removing platform ${dto.id} in room ${roomId}`);

    const payload: GamePlatformRemoveNotifyDto = {
      roomId: roomId,
      id: dto.id,
    };

    this.server
      .to(`room:${roomId}:mobiles`)
      .emit(WsGateway.EV.GAME_PLATFORM_REMOVE_NOTIFY, payload);

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
