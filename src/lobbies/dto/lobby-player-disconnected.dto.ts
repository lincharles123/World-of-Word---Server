import { IsString, IsEnum } from 'class-validator';
import { LobbyActor } from '../enums/lobby-actor.enum';

export class LobbyPlayerDisconnectedDto {
  @IsString()
  username: string;

  @IsEnum(LobbyActor)
  actor: LobbyActor;
}
