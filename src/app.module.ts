import { Module } from '@nestjs/common';
import { GameGateway } from './game/game.gateway';
import { GameService } from './game/game.service';
import { RateLimiterService } from './game/anti-spam/rate-limiter.service';
import { CooldownService } from './game/anti-spam/cooldown.service';
import { WebSocketRateLimitGuard } from './game/anti-spam/websocket-rate-limit.guard';
import { CooldownGuard } from './game/anti-spam/cooldown.guard';
import { RateLimitAdminController } from './admin/rate-limit-admin.controller';
import { CooldownAdminController } from './admin/cooldown-admin.controller';

@Module({
  controllers: [RateLimitAdminController, CooldownAdminController],
  providers: [
    GameGateway,
    GameService,
    RateLimiterService,
    CooldownService,
    WebSocketRateLimitGuard,
    CooldownGuard
  ]
})
export class AppModule {}
