import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AtestadosModule } from './modules/atestados/atestados.module.js';
import { GeminiModule } from './common/gemini/gemini.module.js';
import { NotificacoesModule } from './modules/notificacoes/notificacoes.module.js';
import { PrismaModule } from './common/prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'on-class-backend',
    }),
    AuthModule,
    AtestadosModule,
    GeminiModule,
    NotificacoesModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}