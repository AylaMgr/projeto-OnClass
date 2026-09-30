import { Controller, Post, Get, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { NotificacoesService } from './notificacoes.service.js';
import { CreateNotificacaoDto } from './dto/criate-notificacao.dto.js';

@Controller('notificacoes')
export class NotificacoesController {
  constructor(private readonly notificacoesService: NotificacoesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async criar(@Body() dto: CreateNotificacaoDto) {
    const alunoIdMock = '2024001234';
    return this.notificacoesService.registrarNotificacao(dto, alunoIdMock);
  }

  @Get('recentes')
  async listarRecentes() {
    const alunoIdMock = '2024001234';
    return this.notificacoesService.listarPorAluno(alunoIdMock);
  }
}