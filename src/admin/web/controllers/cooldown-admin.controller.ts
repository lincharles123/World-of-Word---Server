import { Controller, Get, Post, Param, Body, Delete } from '@nestjs/common';
import { CooldownService } from '../../services/cooldown.service';

@Controller('admin/cooldown')
export class CooldownAdminController {
  constructor(private readonly cooldownService: CooldownService) {}

  @Get('stats')
  getAllStats() {
    return {
      timestamp: new Date().toISOString(),
      cooldowns: this.cooldownService.getAllCooldownStats(),
      metrics: this.cooldownService.getMetrics(),
    };
  }

  @Get('stats/:clientId')
  getStatsForClient(@Param('clientId') clientId: string) {
    return {
      clientId,
      timestamp: new Date().toISOString(),
      stats: this.cooldownService.getCooldownStats(clientId),
    };
  }

  @Post('reset/:clientId')
  resetCooldown(@Param('clientId') clientId: string) {
    this.cooldownService.resetCooldown(clientId);

    return {
      message: `Cooldown reset for client ${clientId}`,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('all')
  resetAllCooldowns() {
    this.cooldownService.resetAllCooldowns();

    return {
      message: 'All cooldowns have been reset',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('penalty/:clientId')
  applyPenalty(@Param('clientId') clientId: string, @Body() body: { reason?: string }) {
    const reason = body?.reason || 'Manual penalty applied by admin';
    this.cooldownService.applyPenalty(clientId, reason);

    return {
      message: `Penalty applied to client ${clientId}`,
      reason,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('config')
  getConfig() {
    return {
      timestamp: new Date().toISOString(),
      config: this.cooldownService.getConfig(),
    };
  }

  @Get('metrics')
  getMetrics() {
    return {
      timestamp: new Date().toISOString(),
      metrics: this.cooldownService.getMetrics(),
    };
  }
}
