import { Injectable, Logger } from '@nestjs/common';

interface ConnectedClient {
  id: string;
  connectedAt: number;
  lastActivity: number;
  ip: string;
  userAgent?: string;
}

@Injectable()
export class ConnectionTrackerService {
  private readonly logger = new Logger(ConnectionTrackerService.name);
  private connectedClients = new Map<string, ConnectedClient>();

  addClient(clientId: string, ip: string, userAgent?: string) {
    const now = Date.now();
    const client: ConnectedClient = {
      id: clientId,
      connectedAt: now,
      lastActivity: now,
      ip,
      userAgent,
    };

    this.connectedClients.set(clientId, client);
    this.logger.log(`Client connecté: ${clientId} (${ip})`);
  }

  removeClient(clientId: string) {
    const client = this.connectedClients.get(clientId);
    if (client) {
      this.connectedClients.delete(clientId);
      const connectionDuration = Date.now() - client.connectedAt;
      this.logger.log(`Client déconnecté: ${clientId} (durée: ${Math.round(connectionDuration / 1000)}s)`);
    }
  }

  updateActivity(clientId: string) {
    const client = this.connectedClients.get(clientId);
    if (client) {
      client.lastActivity = Date.now();
    }
  }

  getConnectedClients(): Map<string, ConnectedClient> {
    return new Map(this.connectedClients);
  }

  getConnectionStats() {
    const now = Date.now();
    const clients = Array.from(this.connectedClients.values());
    
    return {
      totalConnected: clients.length,
      connections: clients.map(client => ({
        id: client.id,
        ip: client.ip,
        connectedAt: client.connectedAt,
        connectedSince: Math.round((now - client.connectedAt) / 1000),
        lastActivity: client.lastActivity,
        lastActivityAgo: Math.round((now - client.lastActivity) / 1000),
        userAgent: client.userAgent,
      })),
    };
  }

  getMetrics() {
    const now = Date.now();
    const clients = Array.from(this.connectedClients.values());
    const activeThreshold = 30000; // 30 secondes

    const activeClients = clients.filter(client => 
      (now - client.lastActivity) < activeThreshold
    ).length;

    return {
      totalConnected: clients.length,
      activeClients,
      inactiveClients: clients.length - activeClients,
      averageConnectionTime: clients.length > 0 
        ? Math.round(clients.reduce((sum, client) => sum + (now - client.connectedAt), 0) / clients.length / 1000)
        : 0,
    };
  }
}