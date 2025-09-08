import { Injectable, Logger } from '@nestjs/common';

interface CooldownEntry {
  lastMessageTime: number;
  messageCount: number;
  violations: number;
}

@Injectable()
export class CooldownService {
  private readonly logger = new Logger(CooldownService.name);
  private readonly cooldowns = new Map<string, CooldownEntry>();

  private readonly config = {
    cooldownDuration: 1000,
    maxViolations: 3,
    violationWindow: 30000,
    penaltyDuration: 60000,
    cleanupInterval: 300000,
  };

  constructor() {
    setInterval(() => this.cleanupExpiredEntries(), this.config.cleanupInterval);
  }

  canSendMessage(clientId: string): {
    allowed: boolean;
    remainingCooldown?: number;
    reason?: string;
    violation?: boolean;
  } {
    const now = Date.now();
    const entry = this.cooldowns.get(clientId);

    if (!entry) {
      this.cooldowns.set(clientId, {
        lastMessageTime: now,
        messageCount: 1,
        violations: 0,
      });
      return { allowed: true };
    }

    const timeSinceLastMessage = now - entry.lastMessageTime;

    if (timeSinceLastMessage < this.config.cooldownDuration) {
      entry.violations++;
      entry.messageCount++;

      const remainingCooldown = Math.ceil(
        (this.config.cooldownDuration - timeSinceLastMessage) / 1000,
      );

      this.logger.warn(
        `Client ${clientId} tried to send message during cooldown. ` +
          `Remaining: ${remainingCooldown}s, Violations: ${entry.violations}`,
      );

      if (entry.violations >= this.config.maxViolations) {
        return {
          allowed: false,
          remainingCooldown: Math.ceil(this.config.penaltyDuration / 1000),
          reason: `Trop de violations de cooldown. Pénalité appliquée.`,
          violation: true,
        };
      }

      return {
        allowed: false,
        remainingCooldown,
        reason: `Cooldown actif. Attendez ${remainingCooldown} secondes.`,
        violation: true,
      };
    }
    entry.lastMessageTime = now;
    entry.messageCount++;

    if (entry.violations > 0 && timeSinceLastMessage > this.config.violationWindow) {
      entry.violations = Math.max(0, entry.violations - 1);
    }

    return { allowed: true };
  }

  getCooldownStats(clientId: string): {
    isOnCooldown: boolean;
    remainingCooldown: number;
    messageCount: number;
    violations: number;
    lastMessageTime?: Date;
  } {
    const entry = this.cooldowns.get(clientId);

    if (!entry) {
      return {
        isOnCooldown: false,
        remainingCooldown: 0,
        messageCount: 0,
        violations: 0,
      };
    }

    const now = Date.now();
    const timeSinceLastMessage = now - entry.lastMessageTime;
    const isOnCooldown = timeSinceLastMessage < this.config.cooldownDuration;
    const remainingCooldown = isOnCooldown
      ? Math.ceil((this.config.cooldownDuration - timeSinceLastMessage) / 1000)
      : 0;

    return {
      isOnCooldown,
      remainingCooldown,
      messageCount: entry.messageCount,
      violations: entry.violations,
      lastMessageTime: new Date(entry.lastMessageTime),
    };
  }

  resetCooldown(clientId: string): void {
    this.cooldowns.delete(clientId);
    this.logger.log(`Cooldown reset for client ${clientId}`);
  }

  resetAllCooldowns(): void {
    const count = this.cooldowns.size;
    this.cooldowns.clear();
    this.logger.log(`All cooldowns reset. Cleared ${count} entries.`);
  }

  getAllCooldownStats(): { [clientId: string]: any } {
    const stats: { [clientId: string]: any } = {};
    const now = Date.now();

    for (const [clientId, entry] of this.cooldowns.entries()) {
      const timeSinceLastMessage = now - entry.lastMessageTime;
      const isOnCooldown = timeSinceLastMessage < this.config.cooldownDuration;

      stats[clientId] = {
        isOnCooldown,
        remainingCooldown: isOnCooldown
          ? Math.ceil((this.config.cooldownDuration - timeSinceLastMessage) / 1000)
          : 0,
        messageCount: entry.messageCount,
        violations: entry.violations,
        lastMessageTime: new Date(entry.lastMessageTime).toISOString(),
        timeSinceLastMessage: Math.ceil(timeSinceLastMessage / 1000),
      };
    }

    return stats;
  }

  getConfig(): any {
    return {
      cooldownDuration: this.config.cooldownDuration,
      cooldownDurationSeconds: this.config.cooldownDuration / 1000,
      maxViolations: this.config.maxViolations,
      violationWindow: this.config.violationWindow,
      violationWindowSeconds: this.config.violationWindow / 1000,
      penaltyDuration: this.config.penaltyDuration,
      penaltyDurationSeconds: this.config.penaltyDuration / 1000,
      description: 'Anti-spam cooldown: 5 seconds between messages',
    };
  }

  applyPenalty(clientId: string, reason: string = 'Manual penalty'): void {
    const now = Date.now();
    const entry = this.cooldowns.get(clientId) || {
      lastMessageTime: 0,
      messageCount: 0,
      violations: 0,
    };

    entry.violations = this.config.maxViolations;
    entry.lastMessageTime = now + this.config.penaltyDuration;

    this.cooldowns.set(clientId, entry);

    this.logger.warn(`Penalty applied to client ${clientId}: ${reason}`);
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    const expiredThreshold = 24 * 60 * 60 * 1000;
    const keysToDelete: string[] = [];

    for (const [clientId, entry] of this.cooldowns.entries()) {
      if (now - entry.lastMessageTime > expiredThreshold || entry.lastMessageTime > now + 60000) {
        keysToDelete.push(clientId);
      }
    }

    keysToDelete.forEach((key) => this.cooldowns.delete(key));

    if (keysToDelete.length > 0) {
      this.logger.debug(`Cleaned up ${keysToDelete.length} expired cooldown entries`);
    }
  }

  getMetrics(): {
    totalClients: number;
    activeClients: number;
    clientsOnCooldown: number;
    totalViolations: number;
    averageViolationsPerClient: number;
  } {
    const now = Date.now();
    let activeClients = 0;
    let clientsOnCooldown = 0;
    let totalViolations = 0;

    for (const [clientId, entry] of this.cooldowns.entries()) {
      const timeSinceLastMessage = now - entry.lastMessageTime;

      if (timeSinceLastMessage < 300000) {
        activeClients++;
      }

      if (timeSinceLastMessage < this.config.cooldownDuration) {
        clientsOnCooldown++;
      }

      totalViolations += entry.violations;
    }

    return {
      totalClients: this.cooldowns.size,
      activeClients,
      clientsOnCooldown,
      totalViolations,
      averageViolationsPerClient:
        this.cooldowns.size > 0
          ? Math.round((totalViolations / this.cooldowns.size) * 100) / 100
          : 0,
    };
  }
}
