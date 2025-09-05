import { Module } from '@nestjs/common';
import { GameGateway } from './game/game.gateway';
import { GameService } from './game/game.service';
import { RateLimiterService } from './game/rate-limiter.service';
import { WebSocketRateLimitGuard } from './game/websocket-rate-limit.guard';
import { RateLimitAdminController } from './admin/rate-limit-admin.controller';

@Module({
  controllers: [RateLimitAdminController],
  providers: [
    GameGateway,
    GameService,
    RateLimiterService,
    WebSocketRateLimitGuard
  ]
})
export class AppModule {}
