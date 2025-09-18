import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { WsGateway } from './ws.gateway';
import { LobbiesModule } from './lobbies/lobbies.module';
import { GamesModule } from './games/games.module';
import { AdminModule } from './admin/admin.module';
import { EventsModule } from './events/events.module';
import { PlayersModule } from './events/players/players.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './entities/games/game.entity';
import { GameDataModule } from './entities/games/game_data.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/',
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'games.db',
      entities: [Game],
      synchronize: true,
    }),
    LobbiesModule,
    AdminModule,
    GamesModule,
    EventsModule,
    PlayersModule,
    GameDataModule
  ],
  providers: [WsGateway],
})
export class AppModule {}
