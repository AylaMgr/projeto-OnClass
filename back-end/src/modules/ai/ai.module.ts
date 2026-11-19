import { Module, forwardRef } from '@nestjs/common';
import { AiController } from './ai.controller.js';
import { IaService } from './ai.service.js';
import { PrismaModule } from '../../common/prisma/prisma.module.js';
import { NotificacoesModule } from '../notificacoes/notificacoes.module.js';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => NotificacoesModule),
  ],
  controllers: [AiController],
  providers: [IaService],
  exports: [IaService],
})
export class IaModule {}