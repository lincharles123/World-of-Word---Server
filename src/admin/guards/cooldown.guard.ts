import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { CooldownService } from '../services/cooldown.service';

@Injectable()
export class CooldownGuard implements CanActivate {
  private readonly logger = new Logger(CooldownGuard.name);

  constructor(private readonly cooldownService: CooldownService) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    const clientId = client.id;

    const result = this.cooldownService.canSendMessage(clientId);

    if (!result.allowed) {
      this.logger.debug(
        `Message blocked for client ${clientId}: ${result.reason}. ` +
          `Remaining: ${result.remainingCooldown}s`,
      );

      if (result.violation) {
        client.emit('cooldownViolation', {
          error: 'Cooldown violation',
          reason: result.reason,
          remainingCooldown: result.remainingCooldown,
          cooldownDuration: 5,
          timestamp: new Date().toISOString(),
          advice: "Attendez avant d'envoyer un autre message pour éviter les pénalités.",
        });
      } else {
        client.emit('cooldownActive', {
          error: 'Cooldown active',
          reason: result.reason,
          remainingCooldown: result.remainingCooldown,
          timestamp: new Date().toISOString(),
        });
      }

      return false;
    }

    return true;
  }
}
