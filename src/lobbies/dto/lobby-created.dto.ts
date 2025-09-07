import { IsString, ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

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
