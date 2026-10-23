import { Controller, Post, Get, Patch, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
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
    return this.notificacoesService.listarRecentes();
  }

  @Get()
  async listarTodas() {
    return this.notificacoesService.listarTodas();
  }

  @Get('aluno/:alunoId')
  async listarPorAluno(@Param('alunoId') alunoId: string) {
    return this.notificacoesService.listarPorAluno(alunoId);
  }

  @Get(':id')
  async buscarPorId(@Param('id') id: string) {
    return this.notificacoesService.buscarPorId(id);
  }

  @Patch(':id/status')
  async atualizarStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.notificacoesService.atualizarStatus(id, status);
  }
}