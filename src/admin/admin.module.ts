import { Module } from '@nestjs/common';
import { AdminWebModule } from './web/admin-web.module';
import { AdminServicesModule } from './services/admin-services.module';
import { CooldownGuard } from './guards/cooldown.guard';
import { WebSocketRateLimitGuard } from './guards/websocket-rate-limit.guard';

@Module({
  imports: [AdminWebModule, AdminServicesModule],
  providers: [CooldownGuard, WebSocketRateLimitGuard],
  exports: [AdminServicesModule, CooldownGuard, WebSocketRateLimitGuard],
})
export class AdminModule {}
