import { Module } from '@nestjs/common';
import { MusicsModule } from './musics/musics.module';
import { OverlayModule } from './overlay/overlay.module';
import { PlatformsModule } from './platforms/platforms.module';
import { PlayersModule } from './players/players.module';

@Module({
  imports: [MusicsModule, OverlayModule, PlatformsModule, PlayersModule],
  exports: [MusicsModule, OverlayModule, PlatformsModule, PlayersModule],
})
export class EventsModule {}
