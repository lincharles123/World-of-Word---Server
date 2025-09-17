import { Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { GameDataModule } from 'src/entities/games/game_data.module';

@Module({
  imports: [GameDataModule],
  providers: [GamesService],
  exports: [GamesService],
})
export class GamesModule {}
