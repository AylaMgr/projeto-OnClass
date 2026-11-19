import { Module, forwardRef } from '@nestjs/common';
import { NotificacoesController } from './notificacoes.controller.js';
import { NotificacoesService } from './notificacoes.service.js';
import { PrismaModule } from '../../common/prisma/prisma.module.js';
import { IaModule } from '../ai/ai.module.js';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => IaModule),
  ],
  controllers: [NotificacoesController],
  providers: [NotificacoesService],
  exports: [NotificacoesService],
})
export class NotificacoesModule {}