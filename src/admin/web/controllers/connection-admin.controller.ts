import { Controller, Get } from '@nestjs/common';
import { ConnectionTrackerService } from '../../services/connection-tracker.service';

@Controller('admin/connections')
export class ConnectionAdminController {
  constructor(private readonly connectionTracker: ConnectionTrackerService) {}

  @Get('stats')
  getConnectionStats() {
    return {
      timestamp: new Date().toISOString(),
      ...this.connectionTracker.getConnectionStats(),
    };
  }

  @Get('metrics')
  getConnectionMetrics() {
    return {
      timestamp: new Date().toISOString(),
      metrics: this.connectionTracker.getMetrics(),
    };
  }

  @Get('live')
  getLiveConnections() {
    const stats = this.connectionTracker.getConnectionStats();
    return {
      timestamp: new Date().toISOString(),
      totalConnected: stats.totalConnected,
      connections: stats.connections.map((conn) => ({
        id: conn.id,
        ip: conn.ip,
        connectedSince: conn.connectedSince,
        lastActivityAgo: conn.lastActivityAgo,
        isActive: conn.lastActivityAgo < 30, // Actif si activité < 30s
      })),
    };
  }
}
