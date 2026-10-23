import { Module } from '@nestjs/common';
import { NotificacoesController } from './notificacoes.controller.js';
import { NotificacoesService } from './notificacoes.service.js';
import { IaModule } from '../ai/ai.module.js';

@Module({
  imports: [IaModule],
  controllers: [NotificacoesController],
  providers: [NotificacoesService]
})
export class NotificacoesModule {}
