import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';
import { existsSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({ origin: '*' });
  
  // Vérification des chemins
  const publicPath = join(__dirname, '..', 'public');
  const adminDashboardPath = join(publicPath, 'admin-dashboard.html');
  
  console.log('📁 Public path:', publicPath);
  console.log('📄 Admin dashboard exists:', existsSync(adminDashboardPath));
  console.log('📄 Admin dashboard path:', adminDashboardPath);
  
  await app.listen(3002);
  
  console.log('🚀 Server started on http://localhost:3002');
  console.log('📊 Admin Dashboard: http://localhost:3002/admin-dashboard.html');
  console.log('🧪 Test Client: http://localhost:3002/test-client.html');
}

bootstrap();