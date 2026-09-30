import { Module } from '@nestjs/common';
import { AtestadosController } from './atestados.controller.js';
import { AtestadosService } from './atestados.service.js';

@Module({
  controllers: [AtestadosController],
  providers: [AtestadosService]
})
export class AtestadosModule {}
