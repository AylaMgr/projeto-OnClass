import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CriarNotificacao } from '../../criar-notificacao/criar-notificacao';
import { NotificacoesService, Notificacao } from '../../notificacoes/services/notificacoes.service.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, CriarNotificacao],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  // Controle de Interface e Formulários
  mostrarFormulario: boolean = false;
  notificacoes: Notificacao[] = [];
  arquivoAtestado: File | null = null;
  carregandoIa: boolean = false;
  processandoEnvio: boolean = false;
  resultadoIa: any = null;
  
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
    private readonly http: HttpClient
  ) {}

  ngOnInit(): void {
    this.carregarNotificacoes();
    this.notificacoesService.notificacaoCriada$.subscribe(() => this.carregarNotificacoes());
  }

  // Normalização padronizada de Status
  private normalizarStatus(statusRaw: any): string {
    if (!statusRaw) return '';
    return String(statusRaw).toUpperCase().trim();
  }

  getStatusClass(statusRaw: string): string {
    const status = this.normalizarStatus(statusRaw);
    if (status.includes('ENCAMINHADO') || status.includes('SECRETARIA') || status === 'APROVADO_SECRETARIA') {
      return 'status-encaminhado';
    }
    if (status.includes('REJEIT') || status.includes('RECUS')) {
      return 'status-rejeitado';
    }
    if (status.includes('APROV') || status === 'CONCLUIDO') {
      return 'status-aprovado';
    }
    return 'status-pendente';
  }

  obterTextoStatus(statusRaw: string): string {
    const status = this.normalizarStatus(statusRaw);
    if (status.includes('ENCAMINHADO') || status.includes('SECRETARIA') || status === 'APROVADO_SECRETARIA') {
      return 'Aceito pela Secretaria - Encaminhado para o Professor (Aguardando resultado final)';
    }
    if (status.includes('REJEIT') || status.includes('RECUS')) {
      return 'Recusado pela Secretaria';
    }
    if (status.includes('APROV') || status === 'CONCLUIDO') {
      return 'Solicitação Aprovada Definitivamente';
    }
    return 'Em Análise pela Secretaria';
  }

  obterAnalista(item: any): string {
    if (item.administrador) return item.administrador;
    return (item.tipo === 'ATESTADO' || item.temUpload || item.arquivoUrl) ? 'IA' : 'Secretaria';
  }

  carregarNotificacoes(): void {
    this.notificacoesService.listarTodas().subscribe({
      next: (dados) => {
        this.notificacoes = dados || [];
      },
      error: (err) => console.error('Erro ao carregar notificações:', err)
    });
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
      if (this.filtroStatus === 'TODOS') return true;

      const itemStatus = this.normalizarStatus(item.status);
      const filtro = this.normalizarStatus(this.filtroStatus);

      if (filtro === 'APROVADO') {
        return itemStatus.includes('APROV') || itemStatus.includes('ENCAMINHADO') || itemStatus.includes('SECRETARIA');
      }
      if (filtro === 'REJEITADO') {
        return itemStatus.includes('REJEIT') || itemStatus.includes('RECUS');
      }
      if (filtro === 'PENDENTE') {
        return itemStatus === 'PENDENTE' || itemStatus === '' || itemStatus.includes('ANALISE');
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
  const nomeFinal = nomeAlunoCadastrado || usuarioSalvo.nome || 'Deborah Brito Espindola da Silva';
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
      this.resultadoIa = res.resultadoIa || res;
      this.carregandoIa = false;
      this.processandoEnvio = false;

      const eAprovado = 
        this.resultadoIa?.nomeConfere &&
        this.resultadoIa?.temDiasAfastamento &&
        this.resultadoIa?.temDataEmissao &&
        this.resultadoIa?.sugestaoAcao === 'APROVAR';

      if (eAprovado) {
        this.salvarOuAtualizarJustificativa('Solicitação Aprovada Definitivamente');
      }
      // Se for recusado, não incrementa contadores: o HTML exibirá os 2 botões na hora
    },
    error: (err) => {
      console.error('Erro ao processar o arquivo com a IA:', err);
      this.carregandoIa = false;
      this.processandoEnvio = false;
      alert('Ocorreu um erro ao conectar com o servidor.');
    }
  });
}

  salvarOuAtualizarJustificativa(statusDefinido: string): void {
    const motivoExtraido = this.resultadoIa?.motivo || 'Tratamento Médico (IA)';
    const parecerIa = this.resultadoIa?.relatorioSecretaria || 'Análise automática realizada por IA.';
    const usuarioSalvo = JSON.parse(localStorage.getItem('user') || '{}');
    const alunoIdFinal = usuarioSalvo.id || usuarioSalvo.alunoId || 1;

    if (!this.idSolicitacaoAtual) {
      this.idSolicitacaoAtual = Date.now();
    }

    const novaNotificacao: Notificacao = {
      id: this.idSolicitacaoAtual,
      administrador: 'IA OnClass',
      motivo: motivoExtraido,
      dataEnvio: new Date().toLocaleDateString('pt-BR'),
      dataInicio: new Date().toISOString(),
      dataFim: new Date().toISOString(),
      status: statusDefinido,
      descricao: `${parecerIa} | Nome Lido: ${this.resultadoIa?.nomeEncontrado || 'N/I'} | Afastamento: ${this.resultadoIa?.datasAfastamento || 'N/I'}`,
      alunoId: alunoIdFinal,
      tipo: 'ATESTADO',
      declaracaoVeracidade: true
    } as any;

    this.http.post('http://localhost:3000/notificacoes', novaNotificacao).subscribe({
      next: () => {
        this.processandoEnvio = false;
        this.carregarNotificacoes();
      },
      error: () => {
        this.processandoEnvio = false;
      }
    });
  }

  enviarParaSecretariaPendente(): void {
    this.salvarOuAtualizarJustificativa('Em Análise pela Secretaria');
    alert('Sua solicitação foi enviada para a Secretaria para análise manual.');
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

    const inputElement = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (inputElement) {
      inputElement.value = '';
    }
  }
}