import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { RateLimiterService } from '../game/rate-limiter.service';

@Controller('admin/rate-limit')
export class RateLimitAdminController {
  constructor(private readonly rateLimiterService: RateLimiterService) {}

  @Get('stats')
  getAllStats() {
    return {
      timestamp: new Date().toISOString(),
      stats: this.rateLimiterService.getAllStats()
    };
  }

  @Get('stats/:identifier/:type')
  getStatsForIdentifier(
    @Param('identifier') identifier: string,
    @Param('type') type: 'global' | 'message' | 'connection'
  ) {
    return {
      identifier,
      type,
      timestamp: new Date().toISOString(),
      stats: this.rateLimiterService.getStats(identifier, type)
    };
  }

  @Post('reset/:identifier')
  resetLimits(
    @Param('identifier') identifier: string,
    @Body() body?: { type?: 'global' | 'message' | 'connection' }
  ) {
    this.rateLimiterService.resetLimits(identifier, body?.type);
    
    return {
      message: `Rate limits reset for ${identifier}`,
      type: body?.type || 'all',
      timestamp: new Date().toISOString()
    };
  }

  @Get('config')
  getConfig() {
    return {
      global: {
        maxRequests: 50,
        windowMs: 60000,
        blockDuration: 300000,
        description: '50 requests per minute, 5 min block'
      },
      perMessage: {
        maxRequests: 10,
        windowMs: 10000,
        blockDuration: 60000,
        description: '10 messages per 10 seconds, 1 min block'
      },
      connection: {
        maxRequests: 5,
        windowMs: 60000,
        blockDuration: 600000,
        description: '5 connections per minute, 10 min block'
      }
    };
  }
}
