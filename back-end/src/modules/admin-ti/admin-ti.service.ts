import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service.js';

@Injectable()
export class AdminTiService {
  constructor(private prisma: PrismaService) {}

  // Busca as configurações visuais e do plano (ou cria uma padrão se não existir)
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

  // Atualiza as cores e a logo do sistema
 async atualizarTema(dados: { logoUrl?: string; corPrimaria: string; corNavbar: string; corCardsPend: string; corCardsAprov: string; corCardsRecus: string }) {
  const config = await this.obterConfiguracao();
  return this.prisma.instituicaoConfig.update({
    where: { id: config.id },
    data: dados,
  });
}

  // Cadastra novos secretários e professores
  async cadastrarUsuario(dados: { nome: string; email: string; role: string; dataNascimento: string; matricula?: string }) {
  return this.prisma.usuario.create({
    data: {
      nome: dados.nome,
      email: dados.email,
      senha: dados.dataNascimento, // E-mail será o Login e a Data de Nascimento a Senha
      dataNascimento: dados.dataNascimento,
      role: dados.role,
      matricula: dados.matricula || `FUNC-${Date.now()}`,
    },
  });
}

  // Lista os usuários cadastrados por perfil
  async listarUsuarios() {
    return this.prisma.usuario.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // Gestão de contatos do suporte
  async listarContatosSuporte() {
    return this.prisma.contatoSuporte.findMany();
  }

  async criarContatoSuporte(dados: { nome: string; telefone: string; setor: string }) {
    return this.prisma.contatoSuporte.create({ data: dados });
  }

  // Retorna estatísticas de uso e planos
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