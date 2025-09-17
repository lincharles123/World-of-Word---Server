import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { GameDataService } from './game_data.service';
import { Game } from './game.entity';

@Controller('games')
export class GameDataController {
  constructor(private readonly gamesService: GameDataService) {}

  @Post()
  create(@Body() gameData: Partial<Game>): Promise<Game> {
    return this.gamesService.create(gameData);
  }

  @Get()
  findAll(): Promise<Game[]> {
    return this.gamesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Game> {
    return this.gamesService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.gamesService.remove(id);
  }
}
