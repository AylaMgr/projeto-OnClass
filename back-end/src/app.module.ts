import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AtestadosModule } from './modules/atestados/atestados.module.js';
import { NotificacoesModule } from './modules/notificacoes/notificacoes.module.js';
import { PrismaModule } from './common/prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { IaModule } from './modules/ai/ai.module.js';
import { AdminTiModule } from './modules/admin-ti/admin-ti.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    AtestadosModule,
    IaModule,
    NotificacoesModule,
    PrismaModule,
    AdminTiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}