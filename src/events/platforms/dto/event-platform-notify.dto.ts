import { IsString } from 'class-validator';
import { EventGlobalNotifyDto } from 'src/events/dto/event-global-notify.dto';

export class EventPlatformNotifyDto extends EventGlobalNotifyDto {
  @IsString()
  platform: string;
}
