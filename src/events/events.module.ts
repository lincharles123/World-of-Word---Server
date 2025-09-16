import { Module } from '@nestjs/common';

import { MusicsModule } from './musics/musics.module';
import { OverlayModule } from './overlay/overlay.module';
import { PlatformsModule } from './platforms/platforms.module';
import { PlayersModule } from './players/players.module';
import { EventService } from './event.service';

@Module({
  imports: [MusicsModule, OverlayModule, PlatformsModule, PlayersModule],
  providers: [EventService],
  exports: [EventService, MusicsModule, OverlayModule, PlatformsModule, PlayersModule],
})
export class EventsModule {}
