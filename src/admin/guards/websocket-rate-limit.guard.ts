import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { RateLimiterService } from '../services/rate-limiter.service';

@Injectable()
export class WebSocketRateLimitGuard implements CanActivate {
  private readonly logger = new Logger(WebSocketRateLimitGuard.name);

  constructor(private readonly rateLimiterService: RateLimiterService) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    const data = context.switchToWs().getData();
    const clientIP = this.getClientIP(client);
    const clientId = client.id;
    const result = this.rateLimiterService.canSendMessage(clientId, clientIP);

    if (!result.allowed) {
      this.logger.warn(
        `Rate limit exceeded for client ${clientId} (IP: ${clientIP}). ` +
          `Reason: ${result.reason}. Retry after: ${result.retryAfter}s`,
      );

      client.emit('rateLimitExceeded', {
        error: 'Rate limit exceeded',
        reason: result.reason,
        retryAfter: result.retryAfter,
        timestamp: new Date().toISOString(),
      });

      this.handleRepeatedAbuse(client, clientIP);

      return false;
    }

    return true;
  }

  private getClientIP(client: any): string {
    const forwarded = client.handshake?.headers['x-forwarded-for'];
    const real = client.handshake?.headers['x-real-ip'];
    const direct = client.handshake?.address;

    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }

    if (real) {
      return real;
    }

    if (direct) {
      return direct;
    }

    return client.conn?.remoteAddress || 'unknown';
  }

  private handleRepeatedAbuse(client: any, clientIP: string): void {
    const stats = this.rateLimiterService.getStats(clientIP, 'global');

    if (stats && stats.blocked) {
      this.logger.error(`Disconnecting abusive client ${client.id} from IP ${clientIP}`);

      client.emit('disconnected', {
        reason: 'Rate limit abuse',
        message: 'You have been disconnected due to repeated rate limit violations.',
        timestamp: new Date().toISOString(),
      });

      setTimeout(() => {
        client.disconnect(true);
      }, 1000);
    }
  }
}
