import {Injectable,BadRequestException,NotFoundException,} from '@nestjs/common';
import * as path from 'path';
import { CreateNotificacaoDto } from './dto/create-notificacao.dto.js';
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

  private sanitizarSegmento(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_-]/g, '');
  }

  gerarNomeArquivoDataHora(nomeOriginal: string): string {
    const agora = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');

    const ano = agora.getFullYear();
    const mes = pad(agora.getMonth() + 1);
    const dia = pad(agora.getDate());
    const hora = pad(agora.getHours());
    const min = pad(agora.getMinutes());
    const seg = pad(agora.getSeconds());

    const ext = path.extname(nomeOriginal || '').toLowerCase() || '.pdf';
    return `${ano}-${mes}-${dia}_${hora}-${min}-${seg}${ext}`;
  }

  async obterPastaAluno(alunoId: string, nomeFallback?: string): Promise<string> {
    let nome = nomeFallback && nomeFallback ! == 'Aluno não identificado' ? nomeFallback: '';
    let matricula = '';

    if (alunoId && /^[0-9a-fA-F]{24}$/.test(alunoId)) {
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: alunoId },
        select: { nome: true, matricula: true },
      });

      if (usuario) {
        nome = usuario.nome || nome;
        matricula = usuario.matricula || matricula;
      }
    }

    if (!matricula && nome) {
      const usuarioPorNome = await this.prisma.usuario.findFirst({
        where: {
          nome: { contains: nome.split(' ')[0], mode: 'insensitive' },
          role: 'ALUNO',
        },
        select: { nome: true, matricula: true },
      });
      if (usuarioPorNome) {
        nome = usuarioPorNome.nome;
        matricula = usuarioPorNome.matricula || '';
      }
    }

    const nomeLimpo = this.sanitizarSegmento(nome || 'Aluno') || 'Aluno';
    const matriculaLimpa = this.sanitizarSegmento(matricula || 'SEM_MATRICULA') || 'SEM_MATRICULA';

    return `alunos/${nomeLimpo}_${matriculaLimpa}`;
  }

  async registrarNotificacao(dto: any, alunoId: string) {
    if (!dto.declaracaoVeracidade) {
      throw new BadRequestException('A declaração de veracidade é obrigatória.');
    }

    const alunoIdFinal = dto.alunoId || alunoId;
    const pastaAluno =
      dto.pastaAluno || (await this.obterPastaAluno(alunoIdFinal, dto.nomeEncontrado));

    const rawInicio = dto.dataInicio || dto.dataInicioInfo || dto.data_inicio;
    const rawFim = dto.dataFim || dto.dataFimInfo || dto.data_fim;

    const dataInicioValida = this.parseDate(rawInicio);
    const dataFimValida = this.parseDate(rawFim);

    // Se vier um atestadoId no payload ou se houver um atestado recente recém-enviado pelo aluno
    let atestadoIdVinculado: string | null = dto.atestadoId || null;
    if (!atestadoIdVinculado && (dto.tipo === 'ATESTADO' || dto.temUpload || dto.arquivoNome)) {
      const ultimoAtestado = await this.prisma.atestado.findFirst({
        where: { alunoId: alunoIdFinal },
        orderBy: { criadoEm: 'desc' },
        select: { id: true },
      });
      atestadoIdVinculado = ultimoAtestado?.id || null;
    }

    const novaNotificacao = await this.prisma.notificacao.create({
      data: {
        alunoId: alunoIdFinal,
        atestadoId: atestadoIdVinculado,
        tipo: dto.tipo || (atestadoIdVinculado ? 'ATESTADO' : 'AUSENCIA_INFORMAL'),
        motivo: dto.motivo,
        dataInicio: dataInicioValida,
        dataFim: dataFimValida,
        descricao:
          dto.descricao ||
          dto.observacoes ||
          `Análise automática realizada por IA. | Nome Lido: ${dto.nomeEncontrado || 'N/I'} | Afastamento: ${dto.datasAfastamento || 'N/I'}`,
        pastaAluno,
        declaracaoVeracidade: dto.declaracaoVeracidade ?? true,
        administrador:
          dto.tipo === 'ATESTADO' || dto.temUpload || dto.arquivoUrl || atestadoIdVinculado
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

  private async enriquecerListaComAlunos(notificacoes: any[]) {
    const idsValidos = Array.from(
      new Set(
        notificacoes
          .map((n) => n.alunoId)
          .filter((id) => id && /^[0-9a-fA-F]{24}$/.test(id)),
      ),
    );

    const usuarios = idsValidos.length
      ? await this.prisma.usuario.findMany({
          where: { id: { in: idsValidos } },
          select: {
            id: true,
            nome: true,
            email: true,
            matricula: true,
            turmas: true,
          },
        })
      : [];

    const mapaAlunos = new Map(usuarios.map((u) => [u.id, u]));

    return notificacoes.map((n) => {
      const aluno = mapaAlunos.get(n.alunoId);
      return {
        ...n,
        aluno,
        alunoNome: aluno?.nome || 'Aluno não identificado',
        matricula: aluno?.matricula || 'N/I',
        alunoMatricula: aluno?.matricula || 'N/I',
        turma: aluno?.turmas?.[0] || 'Não informada',
        alunoTurma: aluno?.turmas?.[0] || 'Não informada',
        temUpload: Boolean(n.atestadoId || n.tipo === 'ATESTADO'),
      };
    });
  }

  async listarTodas() {
    const lista = await this.prisma.notificacao.findMany({
      orderBy: { dataEnvio: 'desc' },
    });
    return this.enriquecerListaComAlunos(lista);
  }

  async listarRecentes() {
    const lista = await this.prisma.notificacao.findMany({
      take: 20,
      orderBy: { dataEnvio: 'desc' },
    });
    return this.enriquecerListaComAlunos(lista);
  }

  async atualizarStatus(id: string, status: string) {
    const notificacao = await this.prisma.notificacao.findUnique({
      where: { id },
    });
    if (!notificacao) {
      throw new NotFoundException(`Notificação com o ID ${id} não foi encontrada.`);
    }

    const statusLower = status.toLowerCase();
    const ehRecusado = statusLower.includes('recusad') || statusLower.includes('rejeitad');

    if (notificacao.atestadoId) {
      await this.prisma.atestado.updateMany({
        where: { id: notificacao.atestadoId },
        data: {
          status: ehRecusado ? 'RECUSADO' : 'APROVADO',
        },
      });
    }

    return this.prisma.notificacao.update({
      where: { id },
      data: {
        status,
        administrador: 'Secretaria',
      },
    });
  }

  async buscarPorId(id: string) {
    const notificacao = await this.prisma.notificacao.findUnique({
      where: { id },
    });
    if (!notificacao) {
      throw new NotFoundException(`Notificação com o ID ${id} não foi encontrada.`);
    }

   let atestado = null;

    if (notificacao.atestadoId) {
      atestado = await this.prisma.atestado.findUnique({
        where: { id: notificacao.atestadoId },
      });
    }

    let aluno = null;
    if (notificacao.alunoId && /^[0-9a-fA-F]{24}$/.test(notificacao.alunoId)) {
      aluno = await this.prisma.usuario.findUnique({
        where: { id: notificacao.alunoId },
        select: {
          id: true,
          nome: true,
          email: true,
          matricula: true,
          turmas: true,
        },
      });
    }

    const turmaReal =
      (Array.isArray(aluno?.turmas) && aluno.turmas.length > 0 ? aluno.turmas[0] : null) ||
      (aluno as any)?.turma ||
      'Não informada';

    const pastaAluno =
      notificacao.pastaAluno ||
      atestado?.pastaAluno ||
      (await this.obterPastaAluno(notificacao.alunoId, aluno?.nome));

    return {
      ...notificacao,
      aluno,
      alunoNome: aluno?.nome || 'Aluno não identificado',
      alunoMatricula: aluno?.matricula || 'N/I',
      turma: turmaReal,
      alunoTurma: turmaReal,
      pastaAluno,
      arquivoBase64: atestado?.arquivoBase64 || null,
      arquivoNome: atestado?.arquivoNome || null,
      arquivoTipo: atestado?.arquivoTipo || null,
    };
  }

  private async resolverAlunoReal(alunoId?: string, nomeFallback?: string) {
    if (alunoId && /^[0-9a-fA-F]{24}$/.test(alunoId)) {
      const porId = await this.prisma.usuario.findUnique({
        where: { id: alunoId },
        select: { id: true, nome: true, email: true, matricula: true, turmas: true },
      });
      if (porId) return porId;
    }

    if (
      nomeFallback &&
      nomeFallback !== 'Aluno não identificado' &&
      nomeFallback !== 'Aluno'
    ) {
      const porNome = await this.prisma.usuario.findFirst({
        where: {
          nome: { contains: nomeFallback.trim().split(' ')[0], mode: 'insensitive' },
          role: 'ALUNO',
        },
        select: { id: true, nome: true, email: true, matricula: true, turmas: true },
      });
      if (porNome) return porNome;
    }

    return null;
  }

  async processarUploadAtestado(file: any, alunoId: string, nomeAluno?: string) {
    const buffer: Buffer = file.buffer;
    const mimeType = file.mimetype || 'application/pdf';

    // Resolve o aluno real na coleção usuarios pelo ID ou pelo nome
    const alunoReal = await this.resolverAlunoReal(alunoId, nomeAluno);
    const alunoIdFinal = alunoReal?.id || alunoId;
    const nomeAlunoFinal = alunoReal?.nome || nomeAluno || 'Aluno não identificado';

    // Define a pasta lógica do aluno (alunos/Nome_Matricula) e renomeia por data/hora (AAAA-MM-DD_HH-mm-ss.ext)
    const pastaAluno = await this.obterPastaAluno(alunoIdFinal, nomeAlunoFinal);
    const arquivoNomeFormatado = this.gerarNomeArquivoDataHora(file.originalname);

    // 1. Guarda o atestado médico em Base64 no MongoDB Atlas com sigilo
    const base64String = `data:${mimeType};base64,${buffer.toString('base64')}`;
    const atestadoSalvo = await this.prisma.atestado.create({
      data: {
        alunoId: alunoIdFinal,
        pastaAluno,
        arquivoNome: arquivoNomeFormatado,
        arquivoTipo: mimeType,
        arquivoBase64: base64String,
        status: 'PENDENTE_ANALISE',
      },
    });

    // 2. Analisa o documento com a IA
    const resultadoIa = await this.iaService.analisarDocumento(
      buffer,
      mimeType,
      nomeAlunoFinal,
    );

    const ehAprovado = resultadoIa?.sugestaoAcao === 'APROVAR';
    const nomeLido = resultadoIa?.nomeEncontrado || 'N/I';
    const afastamento = resultadoIa?.datasAfastamento || 'N/I';
    const relatorio =
      resultadoIa?.relatorioSecretaria ||
      (ehAprovado ? 'Validado por IA' : 'Encaminhado para análise manual');
    const descricaoDetalhada = `${relatorio} | Nome Lido: ${nomeLido} | Afastamento: ${afastamento} | Pasta: ${pastaAluno} | Arquivo: ${arquivoNomeFormatado}`;

    await this.prisma.atestado.update({
      where: { id: atestadoSalvo.id },
      data: {
        medico: resultadoIa?.medico || null,
        crm: resultadoIa?.crm || null,
        cid: resultadoIa?.cid || null,
        dataInicio: resultadoIa?.dataInicio || null,
        diasAfastado: resultadoIa?.diasAfastado ? Number(resultadoIa.diasAfastado) : null,
        status: ehAprovado ? 'APROVADO' : 'PENDENTE_ANALISE',
        analiseGemini: relatorio,
      },
    });

    const novaSolicitacao = await this.prisma.notificacao.create({
      data: {
        alunoId: alunoIdFinal,
        atestadoId: atestadoSalvo.id,
        motivo: resultadoIa?.motivo || 'Atestado Médico (Análise IA)',
        status: ehAprovado ? 'Solicitação Aprovada Definitivamente' : 'Pendente',
        administrador: ehAprovado ? 'IA OnClass' : 'Secretaria',
        dataEnvio: new Date(),
        dataInicio: this.parseDate(resultadoIa?.dataInicio),
        dataFim: this.parseDate(resultadoIa?.dataFim),
        descricao: descricaoDetalhada,
        pastaAluno,
        tipo: 'ATESTADO',
        declaracaoVeracidade: true,
      },
    });

    return {
      sucesso: true,
      mensagem: 'Solicitação registrada com sucesso no banco de dados.',
      dados: novaSolicitacao,
      solicitacao: novaSolicitacao,
      resultadoIa,
      atestadoId: atestadoSalvo.id,
      pastaAluno,
      arquivoNome: arquivoNomeFormatado,
    };
  }
}