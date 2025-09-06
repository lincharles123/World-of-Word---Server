import { UseGuards, applyDecorators } from '@nestjs/common';
import { WebSocketRateLimitGuard } from '../websocket-rate-limit.guard';
import { CooldownGuard } from '../cooldown/cooldown.guard';

export function AntiSpamProtection() {
  return applyDecorators(
    UseGuards(CooldownGuard, WebSocketRateLimitGuard)
  );
}

export function CooldownProtection() {
  return applyDecorators(
    UseGuards(CooldownGuard)
  );
}
