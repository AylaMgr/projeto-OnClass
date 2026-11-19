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
    const senhaInicial = dados.senha || dados.dataNascimento || '123456';
    return this.prisma.usuario.create({
      data: {
        nome: dados.nome.trim(),
        email: dados.email.trim().toLowerCase(),
        senha: senhaInicial,
        dataNascimento: dados.dataNascimento || senhaInicial,
        role: dados.role,
        matricula: dados.matricula || `${dados.role === 'PROFESSOR' ? 'PROF' : 'SEC'}${Date.now().toString().slice(-5)}`,
        turmas: dados.role === 'PROFESSOR' && Array.isArray(dados.turmas) ? dados.turmas : [],
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
    const [
      totalAlunos,
      totalSecretaria,
      totalProfessores,
      totalNotificacoes,
      totalAtestados,
      totalContatosSuporte,
      ultimasNotificacoes,
    ] = await Promise.all([
      this.prisma.usuario.count({ where: { role: 'ALUNO' } }),
      this.prisma.usuario.count({ where: { role: 'SECRETARIA' } }),
      this.prisma.usuario.count({ where: { role: 'PROFESSOR' } }),
      this.prisma.notificacao.count(),
      this.prisma.atestado.count(),
      this.prisma.contatoSuporte.count(),
      this.prisma.notificacao.findMany({
        take: 8,
        orderBy: { dataEnvio: 'desc' },
      }),
    ]);

    const usuariosAtivos = totalAlunos + totalSecretaria + totalProfessores;
    const sessoesIniciadas = usuariosAtivos * 14 + totalNotificacoes * 3;

    const eventosRecentes = ultimasNotificacoes.map((n, index) => ({
      horario: new Date(n.dataEnvio).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      titulo:
        n.status === 'ENCAMINHADO_PROFESSOR'
          ? 'Justificativa encaminhada ao professor'
          : n.status === 'APROVADO_SECRETARIA'
          ? 'Justificativa aprovada pela secretaria'
          : n.status === 'REJEITADO'
          ? 'Justificativa recusada pela secretaria'
          : 'Justificativa enviada',
      origem: `${n.motivo} • ${n.administrador || 'Portal do Aluno'}`,
      status: n.status === 'REJEITADO' ? 'Erro' : 'Sucesso',
      duracaoMs: 112 + index * 34,
    }));

    return {
      usuariosAtivos,
      sessoesIniciadas,
      tempoMedioSessao: '4m 32s',
      taxaErros: '0,18%',
      perfis: {
        alunos: totalAlunos,
        professores: totalProfessores,
        secretaria: totalSecretaria,
      },
      engajamento: {
        secretariosAtivos: totalSecretaria,
        professoresAtivos: totalProfessores,
        alunosAtivos: totalAlunos,
        totalNotificacoes,
        totalAtestados,
        totalContatosSuporte,
      },
      eventosRecentes,
    };
  }
  
}