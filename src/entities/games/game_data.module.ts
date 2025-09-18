import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './game.entity';
import { GameDataService } from './game_data.service';
import { GameDataController } from './game_data.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Game])],
  providers: [GameDataService],
  controllers: [GameDataController],
  exports: [GameDataService]
})
export class GameDataModule {}
