import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NotificacoesService } from './notificacoes.service.js';
import { CreateNotificacaoDto } from './dto/criate-notificacao.dto.js';
import { UpdateNotificacaoStatusDto } from './dto/update-notificacao-status.dto.js';

@ApiTags('Notificações')
@Controller('notificacoes')
export class NotificacoesController {
  constructor(private readonly notificacoesService: NotificacoesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar nova notificação de ausência informal' })
  async criar(@Body() dto: CreateNotificacaoDto) {
    // ObjectId válido de 24 caracteres hexadecimais compatível com MongoDB
    const alunoIdMock = '673a9f12c8e4b20012a4b5c6';
    return this.notificacoesService.registrarNotificacao(dto, alunoIdMock);
  }

  @Get('recentes')
  @ApiOperation({ summary: 'Listar as 10 notificações mais recentes' })
  async listarRecentes() {
    return this.notificacoesService.listarRecentes();
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as notificações' })
  async listarTodas() {
    return this.notificacoesService.listarTodas();
  }

  @Get('aluno/:alunoId')
  @ApiOperation({ summary: 'Listar notificações de um aluno específico' })
  async listarPorAluno(@Param('alunoId') alunoId: string) {
    return this.notificacoesService.listarPorAluno(alunoId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar detalhes de uma notificação pelo ID' })
  async buscarPorId(@Param('id') id: string) {
    return this.notificacoesService.buscarPorId(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Atualizar o status da notificação (Aprovar / Recusar / Encaminhar)' })
  async atualizarStatus(
    @Param('id') id: string,
    @Body() dto: UpdateNotificacaoStatusDto,
  ) {
    return this.notificacoesService.atualizarStatus(id, dto.status);
  }
}