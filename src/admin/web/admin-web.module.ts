import { Module } from '@nestjs/common';
import { CooldownAdminController } from './controllers/cooldown-admin.controller';
import { RateLimitAdminController } from './controllers/rate-limit-admin.controller';
import { ConnectionAdminController } from './controllers/connection-admin.controller';
import { AdminServicesModule } from '../services/admin-services.module';

@Module({
  imports: [AdminServicesModule],
  controllers: [
    CooldownAdminController, 
    RateLimitAdminController, 
    ConnectionAdminController
  ],
})
export class AdminWebModule {}