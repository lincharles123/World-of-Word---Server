import { Module } from '@nestjs/common';
import { CooldownService } from './cooldown.service';
import { RateLimiterService } from './rate-limiter.service';
import { ConnectionTrackerService } from './connection-tracker.service';

@Module({
  providers: [CooldownService, RateLimiterService, ConnectionTrackerService],
  exports: [CooldownService, RateLimiterService, ConnectionTrackerService],
})
export class AdminServicesModule {}