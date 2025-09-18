import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { GameDataService } from './game_data.service';
import { Game } from './game.entity';
import { GameGetDto } from './dto/game_get.dto';


@Controller('games')
export class GameDataController {
  constructor(private readonly gamesService: GameDataService) {}

  @Post()
  create(@Body() gameData: Partial<Game>): Promise<Game> {
    return this.gamesService.create(gameData);
  }

  @Get()
  getGames(@Query() query: GameGetDto): Promise<Game[]> {
    return this.gamesService.find(query);
  }
}
