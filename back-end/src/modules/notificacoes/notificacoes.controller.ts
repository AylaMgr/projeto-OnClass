import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ForbiddenException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificacoesService } from './notificacoes.service.js';
import { CreateNotificacaoDto } from './dto/create-notificacao.dto.js';
import { UpdateNotificacaoStatusDto } from './dto/update-notificacao-status.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt.auth.guard.js';


@ApiTags('Notificações')
@ApiBearerAuth()
@Controller('notificacoes')
export class NotificacoesController {
  constructor(private readonly notificacoesService: NotificacoesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar nova notificação de ausência informal do aluno logado' })
  async criar(@Body() dto: CreateNotificacaoDto, @Req() req: any) {
    const alunoIdToken = req.user?.sub || req.user?.id || (dto as any).alunoId;
    if (!alunoIdToken) {
      throw new BadRequestException('Identificação do aluno não encontrada no token.');
    }
    return this.notificacoesService.registrarNotificacao(dto, alunoIdToken);
  }

  @Post('upload-atestado')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Enviar atestado médico com análise da IA para aprovação da Secretaria' })
  async uploadAtestado(
    @UploadedFile() file: any,
    @Req() req: any,
    @Body('alunoId') alunoIdBody?: string,
    @Body('nomeAluno') nomeAluno?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado.');
    }

    const alunoIdFinal = req.user?.sub || req.user?.id || alunoIdBody;
    const nomeAlunoFinal = nomeAluno || req.user?.nome;

    if (!alunoIdFinal) {
      throw new BadRequestException('Identificação do aluno não encontrada.');
    }

    return this.notificacoesService.processarUploadAtestado(
      file,
      alunoIdFinal,
      nomeAlunoFinal,
    );
  }

  @Get('recents')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Listar as 10 notificações mais recentes' })
  async listarRecentes() {
    return this.notificacoesService.listarRecentes();
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Listar todas as notificações' })
  async listarTodas() {
    return this.notificacoesService.listarTodas();
  }

  @Get('aluno/:alunoId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Listar notificações de um aluno específico' })
  async listarPorAluno(@Param('alunoId') alunoId: string, @Req() req: any) {
    // Se quem está consultando é um ALUNO, garante que só lê os seus próprios dados
    if (req.user?.role === 'ALUNO' && req.user?.sub !== alunoId) {
      throw new ForbiddenException('Acesso negado aos registros de outro aluno.');
    }
    return this.notificacoesService.listarPorAluno(alunoId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Buscar detalhes de uma notificação pelo ID (com anexo Base64)' })
  async buscarPorId(@Param('id') id: string) {
    return this.notificacoesService.buscarPorId(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Atualizar o status da notificação (Apenas Secretaria ou Professor)' })
  async atualizarStatus(
    @Param('id') id: string,
    @Body() dto: UpdateNotificacaoStatusDto,
    @Req() req: any,
  ) {
    const role = req.user?.role;
    if (role !== 'SECRETARIA' && role !== 'PROFESSOR' && role !== 'ADMIN') {
      throw new ForbiddenException(
        'Apenas Secretaria ou Professor podem alterar o status da solicitação.',
      );
    }
    return this.notificacoesService.atualizarStatus(id, dto.status);
  }
}