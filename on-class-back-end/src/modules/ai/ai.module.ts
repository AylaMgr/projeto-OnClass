import { Module } from '@nestjs/common';
import { AiService } from './ai.service.js';
import { AiController } from './ai.controller.js';

@Module({
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService], // Permite reusar a IA em outros serviços do NestJS
})
export class AiModule {}