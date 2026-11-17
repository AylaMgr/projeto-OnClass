import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import { CreateAtestadoDto } from './dto/create-atestado.dto.js';
import { UpdateAtestadoStatusDto } from './dto/update-atestado.dto.js';

@Injectable()
export class AtestadosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAtestadoDto) {
    return this.prisma.atestado.create({
      data: {
        alunoId: dto.alunoId,
        medico: dto.medico,
        crm: dto.crm,
        cid: dto.cid,
        dataInicio: dto.dataInicio,
        diasAfastado: dto.diasAfastado,
        arquivoNome: dto.arquivoNome,
        arquivoTipo: dto.arquivoTipo,
        arquivoBase64: dto.arquivoBase64,
        status: 'PENDENTE_ANALISE',
      },
      select: {
        id: true,
        alunoId: true,
        medico: true,
        crm: true,
        cid: true,
        dataInicio: true,
        diasAfastado: true,
        arquivoNome: true,
        arquivoTipo: true,
        status: true,
        criadoEm: true,
      },
    });
  }

  // Listagem geral (para Secretaria/Professor) sem carregar o Base64 pesado
  async findAll() {
    return this.prisma.atestado.findMany({
      orderBy: { criadoEm: 'desc' },
      select: {
        id: true,
        alunoId: true,
        medico: true,
        crm: true,
        cid: true,
        dataInicio: true,
        diasAfastado: true,
        arquivoNome: true,
        arquivoTipo: true,
        status: true,
        analiseGemini: true,
        criadoEm: true,
      },
    });
  }

  // Listagem filtrada apenas para o próprio aluno
  async findByAluno(alunoId: string) {
    return this.prisma.atestado.findMany({
      where: { alunoId },
      orderBy: { criadoEm: 'desc' },
      select: {
        id: true,
        alunoId: true,
        medico: true,
        crm: true,
        cid: true,
        dataInicio: true,
        diasAfastado: true,
        arquivoNome: true,
        arquivoTipo: true,
        status: true,
        analiseGemini: true,
        criadoEm: true,
      },
    });
  }

  // Rota protegida para visualizar o ficheiro Base64 com sigilo
  async findArquivoSeguro(
    id: string,
    usuarioLogado: { userId?: string; id?: string; role: string },
  ) {
    const atestado = await this.prisma.atestado.findUnique({
      where: { id },
    });

    if (!atestado) {
      throw new NotFoundException('Atestado médico não encontrado.');
    }

    const idRequisitante = usuarioLogado.userId ?? usuarioLogado.id;
    const perfisAutorizados = ['SECRETARIA', 'PROFESSOR', 'ADMIN_TI'];

    // Bloqueia qualquer aluno que não seja o titular do atestado
    if (
      !perfisAutorizados.includes(usuarioLogado.role) &&
      atestado.alunoId !== idRequisitante
    ) {
      throw new ForbiddenException(
        'Acesso negado: não tem permissão para visualizar este atestado médico.',
      );
    }

    return {
      id: atestado.id,
      arquivoNome: atestado.arquivoNome,
      arquivoTipo: atestado.arquivoTipo,
      arquivoBase64: atestado.arquivoBase64,
    };
  }

  async updateStatus(id: string, dto: UpdateAtestadoStatusDto) {
    return this.prisma.atestado.update({
      where: { id },
      data: {
        status: dto.status,
        ...(dto.analiseGemini !== undefined && {
          analiseGemini: dto.analiseGemini,
        }),
      },
    });
  }
}