import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateNotificacaoDto } from './dto/criate-notificacao.dto.js';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import { IaService } from '../ai/ai.service.js';

@Injectable()
export class NotificacoesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly iaService: IaService,
  ) {}

  private parseDate(valor: any): Date {
    if (!valor) return new Date();

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

    const dataInicioValida = this.parseDate(rawInicio);
    const dataFimValida = this.parseDate(rawFim);

    const novaNotificacao = await this.prisma.notificacao.create({
      data: {
        alunoId: alunoId || dto.alunoId,
        motivo: dto.motivo,
        dataInicio: dataInicioValida,
        dataFim: dataFimValida,
        descricao:
          dto.descricao ||
          dto.observacoes ||
          `Análise automática realizada por IA. | Nome Lido: ${dto.nomeEncontrado || 'N/I'} | Afastamento: ${dto.datasAfastamento || 'N/I'}`,
        declaracaoVeracidade: dto.declaracaoVeracidade ?? true,
        administrador:
          dto.tipo === 'ATESTADO' || dto.temUpload || dto.arquivoUrl
            ? 'IA'
            : 'Secretaria',
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
    const notificacao = await this.prisma.notificacao.findUnique({
      where: { id },
    });
    if (!notificacao) {
      throw new NotFoundException(`Notificação com o ID ${id} não foi encontrada.`);
    }
    return this.prisma.notificacao.update({
      where: { id },
      data: { status },
    });
  }

  async buscarPorId(id: string) {
    const notificacao = await this.prisma.notificacao.findUnique({
      where: { id },
    });
    if (!notificacao) {
      throw new NotFoundException(`Notificação com o ID ${id} não foi encontrada.`);
    }

    const atestado = notificacao.alunoId
      ? await this.prisma.atestado.findFirst({
          where: { alunoId: notificacao.alunoId },
          orderBy: { id: 'desc' },
        })
      : null;

    return {
      ...notificacao,
      arquivoBase64: atestado?.arquivoBase64 || null,
      arquivoNome: atestado?.arquivoNome || null,
      arquivoTipo: atestado?.arquivoTipo || null,
    };
  }

  async processarUploadAtestado(file: any, alunoId: string, nomeAluno: string) {
    const fs = require('fs');
    const buffer: Buffer = file.buffer || fs.readFileSync(file.path);
    const mimeType = file.mimetype || 'application/pdf';

    // 1. Guarda o atestado médico em Base64 no MongoDB Atlas com sigilo
    const base64String = `data:${mimeType};base64,${buffer.toString('base64')}`;
    const atestadoSalvo = await this.prisma.atestado.create({
      data: {
        alunoId,
        arquivoNome: file.originalname || 'atestado_medico',
        arquivoTipo: mimeType,
        arquivoBase64: base64String,
        status: 'PENDENTE_ANALISE',
      },
    });

    // 2. Analisa o documento com a IA
    const resultadoIa = await this.iaService.analisarDocumento(
      buffer,
      mimeType,
      nomeAluno,
    );

    if (resultadoIa?.sugestaoAcao === 'APROVAR') {
      const nomeLido = resultadoIa.nomeEncontrado || 'N/I';
      const afastamento = resultadoIa.datasAfastamento || 'N/I';
      const relatorio = resultadoIa.relatorioSecretaria || 'Validado por IA';
      const descricaoDetalhada = `${relatorio} | Nome Lido: ${nomeLido} | Afastamento: ${afastamento}`;

      await this.prisma.atestado.update({
        where: { id: atestadoSalvo.id },
        data: {
          status: 'APROVADO',
          analiseGemini: relatorio,
        },
      });

      const novaSolicitacao = await this.prisma.notificacao.create({
        data: {
          alunoId,
          motivo: resultadoIa.motivo || 'Tratamento Médico (IA)',
          status: 'SOLICITACAO_APROVADA_DEFINITIVAMENTE',
          administrador: 'IA OnClass',
          dataEnvio: new Date(),
          dataInicio: this.parseDate(resultadoIa.dataInicio),
          dataFim: this.parseDate(resultadoIa.dataFim),
          descricao: descricaoDetalhada,
          tipo: 'ATESTADO',
          declaracaoVeracidade: true,
        },
      });

      return { resultadoIa, solicitacao: novaSolicitacao, atestadoId: atestadoSalvo.id };
    }

    return { resultadoIa, atestadoId: atestadoSalvo.id };
  }
}