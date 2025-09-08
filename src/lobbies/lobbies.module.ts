import { Module } from '@nestjs/common';
import { LobbiesService } from './lobbies.service';

@Module({
  providers: [LobbiesService],
  exports: [LobbiesService],
})
export class LobbiesModule {}
