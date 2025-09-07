import { Injectable, Logger } from '@nestjs/common';

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
  blockExpiresAt?: number;
}

@Injectable()
export class RateLimiterService {
  private readonly logger = new Logger(RateLimiterService.name);
  private readonly limits = new Map<string, RateLimitEntry>();

  private readonly config = {
    global: {
      maxRequests: 50,
      windowMs: 60000,
      blockDuration: 300000,
    },
    message: {
      maxRequests: 10,
      windowMs: 10000,
      blockDuration: 60000,
    },
    connection: {
      maxRequests: 5,
      windowMs: 60000,
      blockDuration: 600000,
    },
  };

  constructor() {
    setInterval(() => this.cleanupExpiredEntries(), 60000);
  }

  canSendMessage(
    clientId: string,
    clientIP: string,
  ): {
    allowed: boolean;
    reason?: string;
    retryAfter?: number;
  } {
    return this.checkLimit(`msg:${clientId}`, 'message');
  }

  canConnect(clientIP: string): {
    allowed: boolean;
    reason?: string;
    retryAfter?: number;
  } {
    return this.checkLimit(`conn:${clientIP}`, 'connection');
  }

  private checkLimit(
    key: string,
    type: 'global' | 'message' | 'connection',
  ): {
    allowed: boolean;
    reason?: string;
    retryAfter?: number;
  } {
    const now = Date.now();
    const config = this.config[type];
    const entry = this.limits.get(key);

    if (!entry) {
      this.limits.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
        blocked: false,
      });
      return { allowed: true };
    }

    if (entry.blocked && entry.blockExpiresAt && now < entry.blockExpiresAt) {
      return {
        allowed: false,
        reason: `Blocked due to rate limit abuse`,
        retryAfter: Math.ceil((entry.blockExpiresAt - now) / 1000),
      };
    }

    if (now >= entry.resetTime) {
      entry.count = 1;
      entry.resetTime = now + config.windowMs;
      entry.blocked = false;
      entry.blockExpiresAt = undefined;
      return { allowed: true };
    }

    if (entry.count >= config.maxRequests) {
      entry.blocked = true;
      entry.blockExpiresAt = now + config.blockDuration;

      this.logger.warn(
        `Rate limit exceeded for ${key}. Blocked for ${config.blockDuration / 1000}s`,
      );

      return {
        allowed: false,
        reason: `Rate limit exceeded`,
        retryAfter: Math.ceil(config.blockDuration / 1000),
      };
    }

    entry.count++;
    return { allowed: true };
  }

  getAllStats(): any {
    const stats: any = {};
    const now = Date.now();

    for (const [key, entry] of this.limits.entries()) {
      stats[key] = {
        count: entry.count,
        blocked: entry.blocked,
        resetTime: new Date(entry.resetTime).toISOString(),
        blockExpiresAt: entry.blockExpiresAt ? new Date(entry.blockExpiresAt).toISOString() : null,
        remainingTime: Math.max(0, Math.ceil((entry.resetTime - now) / 1000)),
      };
    }

    return stats;
  }

  getStats(identifier: string, type: 'global' | 'message' | 'connection'): any {
    const key = type === 'connection' ? `conn:${identifier}` : `msg:${identifier}`;
    const entry = this.limits.get(key);

    if (!entry) {
      return {
        count: 0,
        blocked: false,
        resetTime: null,
        remainingTime: 0,
      };
    }

    const now = Date.now();
    return {
      count: entry.count,
      blocked: entry.blocked,
      resetTime: new Date(entry.resetTime).toISOString(),
      blockExpiresAt: entry.blockExpiresAt ? new Date(entry.blockExpiresAt).toISOString() : null,
      remainingTime: Math.max(0, Math.ceil((entry.resetTime - now) / 1000)),
    };
  }

  resetLimits(identifier: string, type?: 'global' | 'message' | 'connection'): void {
    if (type) {
      const key = type === 'connection' ? `conn:${identifier}` : `msg:${identifier}`;
      this.limits.delete(key);
      this.logger.log(`Rate limit reset for ${key}`);
    } else {
      const keysToDelete = Array.from(this.limits.keys()).filter((key) => key.includes(identifier));
      keysToDelete.forEach((key) => this.limits.delete(key));
      this.logger.log(
        `All rate limits reset for ${identifier}. Cleared ${keysToDelete.length} entries.`,
      );
    }
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.limits.entries()) {
      if (now >= entry.resetTime && (!entry.blockExpiresAt || now >= entry.blockExpiresAt)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.limits.delete(key));

    if (keysToDelete.length > 0) {
      this.logger.debug(`Cleaned up ${keysToDelete.length} expired rate limit entries`);
    }
  }
}
