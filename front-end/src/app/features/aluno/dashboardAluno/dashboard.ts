import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CriarNotificacao } from '../../criar-notificacao/criar-notificacao';
import { NotificacoesService, Notificacao } from '../../notificacoes/services/notificacoes.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, CriarNotificacao],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  // Controle de Interface e Formulários
  termoPesquisa: string = '';
  mostrarFormulario: boolean = false;
  notificacoes: Notificacao[] = [];
  arquivoAtestado: File | null = null;
  carregandoIa: boolean = false;
  processandoEnvio: boolean = false;
  resultadoIa: any = null;
  nomeExtraidoIa: string = 'N/I';
  afastamentoExtraidoIa: string = 'N/I';
  parecerIa: string = 'Análise automática realizada por IA.';
  
  // Controle de Seleção e Timeline Independente
  notificacaoSelecionada: Notificacao | null = null;
  
  // Regra de Tentativas e Persistência
  tentativasRecusadas: number = 0;
  idSolicitacaoAtual: number | null = null;

  // Filtros e Paginação
  filtroStatus: string = 'TODOS';
  paginaAtual: number = 1;
  itensPorPagina: number = 5;

  constructor(
    private readonly notificacoesService: NotificacoesService,
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.carregarNotificacoes();
    this.notificacoesService.notificacaoCriada$.subscribe(() => this.carregarNotificacoes());
  }

  // Normalização padronizada de Status
  private normalizarStatus(statusRaw: any): string {
  if (!statusRaw) return '';
  return String(statusRaw)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .toUpperCase()
    .trim();
}

  getStatusClass(statusRaw: string): string {
  const status = this.normalizarStatus(statusRaw);
  
  if (status.includes('APROV') || status.includes('CONCLU')) {
    return 'status-aprovado';
  }
  if (status.includes('REJEIT') || status.includes('RECUS')) {
    return 'status-rejeitado';
  }
  if (status.includes('SECRETARIA') || status.includes('ANALISE') || status.includes('PENDENTE')) {
    return 'status-pendente';
  }
  return 'status-pendente';
}

obterTextoStatus(statusRaw: string): string {
  const status = this.normalizarStatus(statusRaw);
  
  if (status.includes('APROV') || status.includes('CONCLU')) {
    return 'Solicitação Aprovada Definitivamente';
  }
  if (status.includes('REJEIT') || status.includes('RECUS')) {
    return 'Recusado pela Secretaria';
  }
  return 'Em Análise pela Secretaria';
}
  obterAnalista(item: any): string {
    if (item.administrador) return item.administrador;
    return (item.tipo === 'ATESTADO' || item.temUpload || item.arquivoUrl) ? 'IA' : 'Secretaria';
  }

  // ==========================================
  // CONTROLE DO CARD DE DETALHES & TIMELINE
  // ==========================================
  abrirDetalhes(item: Notificacao): void {
    this.notificacaoSelecionada = item;
    // Opcional: fecha formulário ativo para focar no detalhe da timeline
    this.mostrarFormulario = false;
  }

  fecharDetalhes(): void {
    this.notificacaoSelecionada = null;
  }

  // ==========================================
  // FILTROS DA TABELA DE ACOMPANHAMENTO
  // ==========================================
  filtrarPorStatus(status: string): void {
    this.filtroStatus = status;
    this.paginaAtual = 1;
  }

  get notificacoesFiltradas(): Notificacao[] {
  return this.notificacoes.filter(item => {
    const termo = this.termoPesquisa.trim().toLowerCase();
    const motivoMatch = !termo || (item.motivo && item.motivo.toLowerCase().includes(termo));

    if (!motivoMatch) return false;
    if (this.filtroStatus === 'TODOS') return true;

    const itemStatus = this.normalizarStatus(item.status);
    const filtro = this.normalizarStatus(this.filtroStatus);

    if (filtro === 'APROVADO') {
      return itemStatus.includes('APROV') || itemStatus.includes('CONCLU') || itemStatus.includes('DEFINITIVAMENTE');
    }
    if (filtro === 'REJEITADO') {
      return itemStatus.includes('REJEIT') || itemStatus.includes('RECUS');
    }
    if (filtro === 'PENDENTE') {
      return itemStatus.includes('PENDENTE') || itemStatus.includes('SECRETARIA') || itemStatus.includes('ANALISE');
    }

    return itemStatus === filtro;
  });
}

  get notificacoesPaginadas(): Notificacao[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return this.notificacoesFiltradas.slice(inicio, inicio + this.itensPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.notificacoesFiltradas.length / this.itensPorPagina) || 1;
  }

  mudarPagina(novaPagina: number): void {
    if (novaPagina >= 1 && novaPagina <= this.totalPaginas) {
      this.paginaAtual = novaPagina;
    }
  }

  // ==========================================
  // FLUXO DE FORMULÁRIO E IA
  // ==========================================
  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.resultadoIa = null;
      this.arquivoAtestado = null;
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.arquivoAtestado = input.files[0];
      this.resultadoIa = null;
      this.enviarAtestadoParaIa();
    }
  }
 enviarAtestadoParaIa(nomeAlunoCadastrado?: string): void {
  if (!this.arquivoAtestado || this.processandoEnvio) return;

  const usuarioSalvo = JSON.parse(localStorage.getItem('user') || '{}');
  const nomeFinal = nomeAlunoCadastrado || usuarioSalvo.nome || 'Deborah W. Brito Espindola da silva';
  const idAluno = usuarioSalvo.id || usuarioSalvo.alunoId || '1';

  this.processandoEnvio = true;
  this.carregandoIa = true;
  this.resultadoIa = null;

  const formData = new FormData();
  formData.append('file', this.arquivoAtestado);
  formData.append('alunoId', String(idAluno));
  formData.append('nomeAluno', nomeFinal);

  this.http.post('http://localhost:3000/ai/upload-atestado', formData).subscribe({
    next: (res: any) => {
      const ia = res.analiseIa || res.analiseIA || res.resultadoIa || res;
      this.resultadoIa = ia;
      this.carregandoIa = false;
      this.processandoEnvio = false;

      if (res.id || res.notificacaoId || ia.id) {
        this.idSolicitacaoAtual = res.id || res.notificacaoId || ia.id;
      }

      this.nomeExtraidoIa = ia.nomeEncontrado || ia.nomeLido || ia.nome || 'N/I';
      this.afastamentoExtraidoIa = ia.datasAfastamento || ia.afastamento || ia.diasAfastamento || 'N/I';
      this.parecerIa = ia.relatorioSecretaria || ia.parecer || 'Análise realizada por IA.';

      // Validação Estrita de IA
      const iaAprovou = ia.sugestaoAcao === 'APROVAR' || ia.sugestao === 'APROVAR' || ia.acao === 'APROVAR';
      const dadosValidos = this.nomeExtraidoIa !== 'N/I' && this.afastamentoExtraidoIa !== 'N/I';

      if (iaAprovou && dadosValidos) {
        this.resultadoIa.sugestaoAcao = 'APROVAR';
        // Aprovado automaticamente: Cria/Atualiza o card nos Acompanhamentos Recentemente como APROVADO DEFINITIVAMENTE
        this.salvarOuAtualizarJustificativa('Solicitação Aprovada Definitivamente');
      } else {
        this.resultadoIa.sugestaoAcao = 'REJEITAR';
        // Negado pela IA: Aguarda decisão do aluno (Encaminhar para Secretaria ou Reenviar imagem)
      }
    },
    error: (err: any) => {
      console.error('Erro ao processar atestado com a IA:', err);
      this.carregandoIa = false;
      this.processandoEnvio = false;
      alert('Ocorreu um erro ao conectar com o servidor.');
    }
  });
}

salvarOuAtualizarJustificativa(statusDefinido: string): void {
  const usuarioSalvo = JSON.parse(localStorage.getItem('user') || '{}');
  const alunoIdFinal = usuarioSalvo.id || usuarioSalvo.alunoId || 1;

  const resIa = this.resultadoIa?.analiseIa || this.resultadoIa?.analiseIA || this.resultadoIa || {};
  
  const nomeFinal = (this.nomeExtraidoIa && this.nomeExtraidoIa !== 'N/I') 
    ? this.nomeExtraidoIa 
    : (resIa.nomeEncontrado || resIa.nomeLido || resIa.nome || 'Deborah W. Brito Espindola da silva');

  const afastamentoFinal = (this.afastamentoExtraidoIa && this.afastamentoExtraidoIa !== 'N/I') 
    ? this.afastamentoExtraidoIa 
    : (resIa.datasAfastamento || resIa.afastamento || resIa.diasAfastamento || '1 dia');

  const eAprovado = statusDefinido === 'Solicitação Aprovada Definitivamente';
  const statusFinal = eAprovado ? 'Solicitação Aprovada Definitivamente' : 'Em Análise pela Secretaria';

  const parecerFinal = eAprovado 
    ? 'Atestado validado e aceito automaticamente por IA.' 
    : 'Atestado encaminhado para análise manual da Secretaria.';

  const descricaoFormatada = `${parecerFinal} | Nome Lido: ${nomeFinal} | Afastamento: ${afastamentoFinal}` +
    (eAprovado ? ' | Notificação enviada ao corpo docente.' : ' | Aguardando validação da Secretaria.');

  // Prepara o objeto com todos os sinalizadores de aprovação para evitar override do backend
  const payloadNotificacao: any = {
    administrador: eAprovado ? 'IA OnClass' : 'Secretaria',
    motivo: resIa.motivo || 'Tratamento Médico (IA)',
    dataEnvio: new Date().toLocaleDateString('pt-BR'),
    dataInicio: new Date().toISOString(),
    horarioEnvio: new Date().toLocaleTimeString ('pt-BR'),
    dataFim: new Date().toISOString(),
    status: statusFinal,
    statusAprovado: eAprovado,
    aprovadoPelaIa: eAprovado,
    descricao: descricaoFormatada,
    alunoId: alunoIdFinal,
    tipo: 'ATESTADO',
    declaracaoVeracidade: true,
    notificarProfessor: eAprovado
  };

  const concluirSalvamento = (resServidor?: any) => {
    if (resServidor?.id) {
      this.idSolicitacaoAtual = resServidor.id;
    }

    // 1. Atualiza a lista na memória com status correto garantido
    const itemAtualizado: Notificacao = {
      id: this.idSolicitacaoAtual || Date.now(),
      ...payloadNotificacao
    };

    const index = this.notificacoes.findIndex(n => n.id === itemAtualizado.id);
    if (index !== -1) {
      this.notificacoes[index] = itemAtualizado;
    } else {
      this.notificacoes.unshift(itemAtualizado);
    }

    this.notificacoes = [...this.notificacoes];
    this.paginaAtual = 1;
    this.processandoEnvio = false;

    // 2. Tenta fazer um PATCH extra de confirmação do status no backend
    if (this.idSolicitacaoAtual) {
      this.http.patch(`http://localhost:3000/notificacoes/${this.idSolicitacaoAtual}`, {
        status: statusFinal,
        administrador: eAprovado ? 'IA OnClass' : 'Secretaria'
      }).subscribe({
        next: () => {},
        error: () => {}
      });
    }
  };

  // Se já temos um ID ativo, tenta o PUT primeiro. Caso contrário ou se der 404, faz o POST!
  if (this.idSolicitacaoAtual) {
    payloadNotificacao.id = this.idSolicitacaoAtual;
    this.http.put(`http://localhost:3000/notificacoes/${this.idSolicitacaoAtual}`, payloadNotificacao).subscribe({
      next: (res) => concluirSalvamento(res),
      error: (err: any) => {
        if (err.status === 404) {
          delete payloadNotificacao.id;
          this.http.post('http://localhost:3000/notificacoes', payloadNotificacao).subscribe({
            next: (res) => concluirSalvamento(res),
            error: () => this.processandoEnvio = false
          });
        } else {
          this.processandoEnvio = false;
        }
      }
    });
  } else {
    this.http.post('http://localhost:3000/notificacoes', payloadNotificacao).subscribe({
      next: (res) => concluirSalvamento(res),
      error: (err: any) => {
        console.error('Erro ao cadastrar notificação:', err);
        this.processandoEnvio = false;
      }
    });
  }
}
carregarNotificacoes(): void {
  this.notificacoesService.listarTodas().subscribe({
    next: (dados: any[]) => {
      if (!dados) return;

      this.notificacoes = dados.map(item => {
        const itemDesc = item.descricao || '';
        const eValidadoIa = item.administrador === 'IA OnClass' || 
                            itemDesc.includes('validado e aceito automaticamente por IA') ||
                            item.aprovadoPelaIa === true;

        // Se for um atestado que foi aprovado pela IA OnClass, mantém o status de Aprovado Definitivamente
        if (eValidadoIa) {
          return {
            ...item,
            status: 'Solicitação Aprovada Definitivamente',
            administrador: 'IA OnClass'
          };
        }
        return item;
      });
    },
    error: (err: any) => {
      console.error('Erro ao carregar notificações:', err);
    }
  });
}

confirmarEnvioAprovado(): void {
  this.salvarOuAtualizarJustificativa('Solicitação Aprovada Definitivamente');
  this.reiniciarAnalise();
}

enviarParaSecretariaPendente(): void {
  // Apenas grava quando o aluno clica no botão de encaminhar para a secretaria
  this.salvarOuAtualizarJustificativa('Em Análise pela Secretaria');
  alert('Sua solicitação foi encaminhada para a análise da Secretaria!');
  this.reiniciarAnalise();
}

reiniciarAnalise(): void {
  this.arquivoAtestado = null;
  this.resultadoIa = null;
  this.carregandoIa = false;
  this.processandoEnvio = false;
  this.tentativasRecusadas = 0;
  this.idSolicitacaoAtual = null;
  this.mostrarFormulario = false;
  this.nomeExtraidoIa = 'N/I';
  this.afastamentoExtraidoIa = 'N/I';
  this.parecerIa = 'Análise automática realizada por IA.';
}

  voltar(): void {
    this.router.navigate(['/login']);
  }
}