import { SequelizeModuleOptions } from '@nestjs/sequelize';
import { Game } from './entities/game.entity';

export const dataBaseConfig: SequelizeModuleOptions = {
  dialect: 'sqlite',
  storage: '.db/data.sqlite3',
  autoLoadModels: true,
  synchronize: false,
  models: [Game]
};