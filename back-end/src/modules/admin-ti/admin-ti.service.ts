import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import { UpdateTemaDto } from './dto/update-tema.dto.js';
import { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import { CreateSuporteDto } from './dto/create-suporte.dto.js';

@Injectable()
export class AdminTiService {
  constructor(private prisma: PrismaService) {}

  async obterConfiguracao() {
    let config = await this.prisma.instituicaoConfig.findFirst();
    if (!config) {
      config = await this.prisma.instituicaoConfig.create({
        data: {
          nomeInstituicao: 'Instituição OnClass',
          cnpj: '00.000.000/0001-00',
        },
      });
    }
    return config;
  }

  async atualizarTema(dados: UpdateTemaDto) {
    const config = await this.obterConfiguracao();
    return this.prisma.instituicaoConfig.update({
      where: { id: config.id },
      data: { ...dados },
    });
  }

  async cadastrarUsuario(dados: CreateUsuarioDto) {
    return this.prisma.usuario.create({
      data: {
        nome: dados.nome,
        email: dados.email,
        senha: dados.dataNascimento,
        dataNascimento: dados.dataNascimento,
        role: dados.role,
        matricula: dados.matricula || `FUNC-${Date.now()}`,
      },
    });
  }

  async listarUsuarios() {
    return this.prisma.usuario.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async listarContatosSuporte() {
    return this.prisma.contatoSuporte.findMany();
  }

  async criarContatoSuporte(dados: CreateSuporteDto) {
    return this.prisma.contatoSuporte.create({ data: { ...dados } });
  }

  async obterMetricasUso() {
    const totalSecretaria = await this.prisma.usuario.count({ where: { role: 'SECRETARIA' } });
    const totalProfessores = await this.prisma.usuario.count({ where: { role: 'PROFESSOR' } });
    const totalNotificacoes = await this.prisma.notificacao.count();

    return {
      engajamento: {
        secretariosAtivos: totalSecretaria,
        professoresAtivos: totalProfessores,
        totalNotificacoes: totalNotificacoes,
      },
      planosDisponiveis: [
        { nome: 'Standard', limiteAlunos: 500, valorMensal: 'R$ 499,00' },
        { nome: 'Pro (Atual)', limiteAlunos: 2000, valorMensal: 'R$ 999,00' },
        { nome: 'Enterprise', limiteAlunos: 10000, valorMensal: 'Sob Consulta' },
      ],
    };
  }
}