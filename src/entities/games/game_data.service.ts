import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from './game.entity';

@Injectable()
export class GameDataService {
  constructor(
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
  ) {}

  create(gameData: Partial<Game>): Promise<Game> {
    const game = this.gameRepository.create(gameData);
    return this.gameRepository.save(game);
  }

  findAll(): Promise<Game[]> {
    return this.gameRepository.find();
  }
}
