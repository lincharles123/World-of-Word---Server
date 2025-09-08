import { IsString, ValidateNested, IsInt, isEnum, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { LobbyState } from '../enums/lobby-state.enum';

export class QrPayloadDto {
  @IsInt()
  v: number;

  @IsString()
  wsUrl: string;

  @IsString()
  roomId: string;

  @IsString()
  joinToken: string;
}

export class LobbyCreatedDto {
  @IsString()
  roomId: string;

  @IsInt()
  maxPlayers: number;

  @ValidateNested()
  @Type(() => QrPayloadDto)
  qrPayload: QrPayloadDto;
}
