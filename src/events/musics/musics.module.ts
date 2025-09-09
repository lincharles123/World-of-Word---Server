import { Module } from '@nestjs/common';
import { MusicsService } from './musics.service';

@Module({
  providers: [MusicsService],
  exports: [MusicsService],
})
export class MusicsModule {}
