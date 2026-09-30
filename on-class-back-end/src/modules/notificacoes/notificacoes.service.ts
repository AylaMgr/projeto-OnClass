import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateNotificacaoDto } from './dto/criate-notificacao.dto.js';
import { PrismaService } from '../../common/prisma/prisma.service.js';

@Injectable()
export class NotificacoesService {
  constructor(private readonly prisma: PrismaService) {}

  async registrarNotificacao(dto: CreateNotificacaoDto, alunoId: string) {
    if (!dto.declaracaoVeracidade) {
      throw new BadRequestException('A declaração de veracidade é obrigatória.');
    }

    const novaNotificacao = await this.prisma.notificacao.create({
      data: {
        alunoId,
        motivo: dto.motivo,
        dataInicio: dto.dataInicio,
        dataFim: dto.dataFim,
        descricao: dto.descricao,
        declaracaoVeracidade: dto.declaracaoVeracidade,
      },
    });

    return {
      sucesso: true,
      mensagem: 'Notificação enviada à secretaria com sucesso!',
      dados: novaNotificacao,
    };
  }

  async listarPorAluno(alunoId: string) {
    return this.prisma.notificacao.findMany({
      where: { alunoId },
      orderBy: { dataEnvio: 'desc' },
    });
  }
}