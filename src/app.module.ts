import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { WsGateway } from './ws.gateway';
import { LobbiesModule } from './lobbies/lobbies.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/',
    }),
    LobbiesModule,
    AdminModule,
  ],
  providers: [WsGateway],
})
export class AppModule {}
