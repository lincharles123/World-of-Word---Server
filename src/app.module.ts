import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { WsGateway } from './ws.gateway';
import { LobbiesModule } from './lobbies/lobbies.module';
import { GamesModule } from './games/games.module';
import { AdminModule } from './admin/admin.module';
import { EventsModule } from './events/events.module';
import { PlayersModule } from './events/players/players.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/',
    }),
    LobbiesModule,
    AdminModule,
    GamesModule,
    EventsModule,
    PlayersModule,
  ],
  providers: [WsGateway],
})
export class AppModule {}
