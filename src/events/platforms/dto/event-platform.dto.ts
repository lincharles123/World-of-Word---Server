import { IsString } from 'class-validator';
import { EventGlobalDto } from 'src/events/dto/event-global.dto';

export class EventPlatformDto extends EventGlobalDto {
  @IsString()
  platform: string;
}
