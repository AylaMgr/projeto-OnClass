import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateNotificacaoDto } from './dto/criate-notificacao.dto.js';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import { Express } from 'express';
import { IaService } from '../ai/ai.service.js';
import 'multer';

@Injectable()
export class NotificacoesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly iaService: IaService,
  ) {}

  // Converte com segurança strings numéricas ("1791244800000"), timestamps ou ISO Strings para Date
  private parseDate(valor: any): Date {
    if (!valor) return new Date();
    
    // Se for string numérica ou número, converte para Number primeiro
    const num = Number(valor);
    if (!isNaN(num) && num > 0) {
      return new Date(num);
    }
    
    const parsed = new Date(valor);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }

    return new Date();
  }

  async registrarNotificacao(dto: any, alunoId: string) {
    if (!dto.declaracaoVeracidade) {
      throw new BadRequestException('A declaração de veracidade é obrigatória.');
    }

    const rawInicio = dto.dataInicio || dto.dataInicioInfo || dto.data_inicio;
    const rawFim = dto.dataFim || dto.dataFimInfo || dto.data_fim;

    // 1. Converte as datas antes de enviar ao Prisma
    const dataInicioValida = this.parseDate(dto.dataInicio);
    const dataFimValida = this.parseDate(dto.dataFim);
    const nomeLido = dto.nomeEncontrado || dto.nomeLido || dto.nomeAluno || 'N/I';
    const afastamentoLido = dto.datasAfastamento || dto.afastamento || dto.diasAfastamento || 'N/I';

    // 2. Persiste no banco com as variáveis 'inicio' e 'fim'
const novaNotificacao = await this.prisma.notificacao.create({
  data: {
    alunoId: alunoId || dto.alunoId,
    motivo: dto.motivo,
    dataInicio: dataInicioValida,
    dataFim: dataFimValida,
    descricao: dto.descricao || dto.observacoes || `Análise automática realizada por IA. | Nome Lido: ${dto.nomeEncontrado || 'N/I'} | Afastamento: ${dto.datasAfastamento || 'N/I'}`,
    declaracaoVeracidade: dto.declaracaoVeracidade ?? true,
    
    // Se houver upload de ficheiro/atestado define como 'IA', caso contrário 'Secretaria'
    administrador: (dto.tipo === 'ATESTADO' || dto.temUpload || dto.arquivoUrl) ? 'IA' : 'Secretaria',
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

  async listarTodas() {
  return this.prisma.notificacao.findMany({
    orderBy: { dataEnvio: 'desc' },
  });
}

  async listarRecentes() {
    return this.prisma.notificacao.findMany({
      take: 10,
      orderBy: { dataEnvio: 'desc' },
    });
  }

  async atualizarStatus(id: string, status: string) {
    const notificacao = await this.prisma.notificacao.findUnique({ where: { id } });
    if (!notificacao) {
      throw new NotFoundException(`Notificação com o ID ${id} não foi encontrada.`);
    }
    return this.prisma.notificacao.update({
      where: { id },
      data: { status },
    });
  }

  async buscarPorId(id: string) {
    const notificacao = await this.prisma.notificacao.findUnique({ where: { id } });
    if (!notificacao) {
      throw new NotFoundException(`Notificação com o ID ${id} não foi encontrada.`);
    }
    return notificacao;
  }

  // Exemplo no serviço do Back-end (atestado.service.ts / notificacao.service.ts)
async processarUploadAtestado(file: any, alunoId: string, nomeAluno: string) {
  // Converte o caminho do arquivo para Buffer ou lê diretamente
  const fs = require('fs');
  const buffer = file.buffer || fs.readFileSync(file.path);
  const mimeType = file.mimetype || 'application/pdf';

  // Passa os 3 parâmetros esperados pelo IaService
  const resultadoIa = await this.iaService.analisarDocumento(buffer, mimeType, nomeAluno);

  if (resultadoIa?.sugestaoAcao === 'APROVAR') {
  // Extrai as informações capturadas pela IA
  const nomeLido = resultadoIa.nomeEncontrado || 'N/I';
  const afastamento = resultadoIa.datasAfastamento || 'N/I';
  const relatorio = resultadoIa.relatorioSecretaria || 'Validado por IA';

  // Formata a descrição com os dados legíveis
  const descricaoDetalhada = `${relatorio} | Nome Lido: ${nomeLido} | Afastamento: ${afastamento}`;

  const novaSolicitacao = await this.prisma.notificacao.create({
    data: {
      alunoId: Number(alunoId) || alunoId,
      motivo: resultadoIa.motivo || 'Tratamento Médico (IA)',
      status: 'SOLICITACAO_APROVADA_DEFINITIVAMENTE',
      administrador: 'IA OnClass',
      dataEnvio: new Date(),
      dataInicio: this.parseDate(resultadoIa.dataInicio),
      dataFim: this.parseDate(resultadoIa.dataFim),
      descricao: descricaoDetalhada, // <--- Descrição atualizada aqui
      tipo: 'ATESTADO',
      declaracaoVeracidade: true
    } as any
  });

  return { resultadoIa, solicitacao: novaSolicitacao };
}
}
}