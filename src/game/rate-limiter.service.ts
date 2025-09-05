import { Injectable, Logger } from '@nestjs/common';

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
  blockUntil?: number;
}

@Injectable()
export class RateLimiterService {
  private readonly logger = new Logger(RateLimiterService.name);
  private readonly rateLimits = new Map<string, RateLimitEntry>();
  
  private readonly config = {
    global: {
      maxRequests: 50,
      windowMs: 60000,
      blockDuration: 300000
    },
    perMessage: {
      maxRequests: 10,
      windowMs: 10000,
      blockDuration: 60000
    },
    connection: {
      maxRequests: 5,
      windowMs: 60000,
      blockDuration: 600000
    }
  };
  canPerformAction(
    identifier: string, 
    actionType: 'global' | 'message' | 'connection' = 'global'
  ): { allowed: boolean; retryAfter?: number; reason?: string } {
    const config = this.config[actionType];
    const key = `${actionType}:${identifier}`;
    const now = Date.now();
    
    let entry = this.rateLimits.get(key);
    
    this.cleanupExpiredEntries();
    
    if (entry?.blocked && entry.blockUntil && now < entry.blockUntil) {
      const retryAfter = Math.ceil((entry.blockUntil - now) / 1000);
      return { 
        allowed: false, 
        retryAfter,
        reason: `Blocked for ${actionType} until ${new Date(entry.blockUntil).toISOString()}`
      };
    }
    if (!entry || now >= entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + config.windowMs,
        blocked: false
      };
      this.rateLimits.set(key, entry);
    }
    entry.count++;
    if (entry.count > config.maxRequests) {
      entry.blocked = true;
      entry.blockUntil = now + config.blockDuration;
      
      this.logger.warn(
        `Rate limit exceeded for ${identifier} on ${actionType}. ` +
        `Blocked until ${new Date(entry.blockUntil).toISOString()}`
      );
      
      const retryAfter = Math.ceil(config.blockDuration / 1000);
      return { 
        allowed: false, 
        retryAfter,
        reason: `Rate limit exceeded for ${actionType}`
      };
    }
    
    return { allowed: true };
  }

  canSendMessage(clientId: string, clientIP: string): { allowed: boolean; retryAfter?: number; reason?: string } {
    const globalCheck = this.canPerformAction(clientIP, 'global');
    if (!globalCheck.allowed) {
      return globalCheck;
    }
    return this.canPerformAction(clientId, 'message');
  }

  canConnect(clientIP: string): { allowed: boolean; retryAfter?: number; reason?: string } {
    return this.canPerformAction(clientIP, 'connection');
  }

  getStats(identifier: string, actionType: 'global' | 'message' | 'connection' = 'global'): {
    count: number;
    limit: number;
    resetTime: number;
    blocked: boolean;
    blockUntil?: number;
  } | null {
    const key = `${actionType}:${identifier}`;
    const entry = this.rateLimits.get(key);
    const config = this.config[actionType];
    
    if (!entry) {
      return {
        count: 0,
        limit: config.maxRequests,
        resetTime: Date.now() + config.windowMs,
        blocked: false
      };
    }
    
    return {
      count: entry.count,
      limit: config.maxRequests,
      resetTime: entry.resetTime,
      blocked: entry.blocked,
      blockUntil: entry.blockUntil
    };
  }

  resetLimits(identifier: string, actionType?: 'global' | 'message' | 'connection'): void {
    if (actionType) {
      const key = `${actionType}:${identifier}`;
      this.rateLimits.delete(key);
    } else {
      const keysToDelete = Array.from(this.rateLimits.keys())
        .filter(key => key.endsWith(`:${identifier}`));
      keysToDelete.forEach(key => this.rateLimits.delete(key));
    }
    
    this.logger.log(`Rate limits reset for ${identifier}`);
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    for (const [key, entry] of this.rateLimits.entries()) {
      if ((!entry.blocked && now >= entry.resetTime) || 
          (entry.blocked && entry.blockUntil && now >= entry.blockUntil)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.rateLimits.delete(key));
    
    if (keysToDelete.length > 0) {
      this.logger.debug(`Cleaned up ${keysToDelete.length} expired rate limit entries`);
    }
  }

  getAllStats(): { [key: string]: any } {
    const stats: { [key: string]: any } = {};
    
    for (const [key, entry] of this.rateLimits.entries()) {
      stats[key] = {
        count: entry.count,
        resetTime: entry.resetTime,
        blocked: entry.blocked,
        blockUntil: entry.blockUntil
      };
    }
    
    return stats;
  }
}
