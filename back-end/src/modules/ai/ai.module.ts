import { Module } from '@nestjs/common';
import { IaService } from './ai.service.js';
import { AiController } from './ai.controller.js';
import { PrismaModule } from '../../common/prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [AiController],
  providers: [IaService],
  exports: [IaService],
})
export class IaModule {}