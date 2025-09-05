import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.enableCors({ origin: "*"});
    app.useStaticAssets('./', {
        prefix: '/',
    });
    await app.listen(process.env.PORT || 3002);
}

bootstrap();
