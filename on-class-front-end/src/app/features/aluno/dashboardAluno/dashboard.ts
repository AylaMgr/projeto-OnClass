import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CriarNotificacao } from '../../criar-notificacao/criar-notificacao';
import { NotificacoesService, Notificacao } from '../../notificacoes/services/notificacoes.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, CriarNotificacao],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  mostrarFormulario: boolean = false;
  notificacoes: Notificacao[] = [];
  arquivoAtestado: File | null = null;

  // Estados para a análise de IA do atestado
  carregandoIa: boolean = false;
  resultadoIa: any = null;

  // Estado para controlar o modal de detalhes
  notificacaoSelecionada: Notificacao | null = null;

  filtroStatus: string = 'TODOS';
  paginaAtual: number = 1;
  itensPorPagina: number = 5;

  constructor(
    private readonly notificacoesService: NotificacoesService,
    private readonly http: HttpClient // Injeção do HttpClient
  ) {}

  ngOnInit(): void {
    this.carregarNotificacoes();
    this.notificacoesService.notificacaoCriada$.subscribe(() => this.carregarNotificacoes());
  }

  // Normaliza o texto de status evitando falhas de comparação
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

  // Mapeia todas as opções possíveis para exibição amigável ao aluno
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

  carregarNotificacoes(): void {
    this.notificacoesService.listarTodas().subscribe({
      next: (dados) => {
        this.notificacoes = dados || [];
      },
      error: (err) => console.error('Erro ao carregar notificações:', err)
    });
  }

  obterAnalista(item: any): string {
    if (item.administrador) {
      return item.administrador;
    }
    return (item.tipo === 'ATESTADO' || item.temUpload || item.arquivoUrl) ? 'IA' : 'Secretaria';
  }

  abrirDetalhes(item: Notificacao): void {
    this.notificacaoSelecionada = item;
  }

  fecharDetalhes(): void {
    this.notificacaoSelecionada = null;
  }

  filtrarPorStatus(status: string): void {
    this.filtroStatus = status;
    this.paginaAtual = 1;
  }

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
  }

 // Trigger disparado assim que o ficheiro é selecionado
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (this.tentativasRecusadas >= 3) {
      alert('Você atingiu o limite de 3 tentativas para este arquivo. Encaminhe para a Secretaria ou selecione outro arquivo.');
      return;
    }
    if (input.files && input.files.length > 0) {
      this.arquivoAtestado = input.files[0];
      this.resultadoIa = null;
      this.enviarAtestadoParaIa();
    }
  }
 // ==========================================
  // ESTADOS PARA O FLUXO DE IA E VALIDAÇÕES
  // ==========================================
  tentativasRecusadas: number = 0;
  processandoEnvio: boolean = false;
  idSolicitacaoAtual: number | null = null;


  enviarAtestadoParaIa(nomeAlunoCadastrado?: string): void {
  // BLOQUEIO 1: Se já atingiu 3 tentativas, impede novos disparos
  if (this.tentativasRecusadas >= 3) {
    alert('Você atingiu o limite de 3 tentativas para este arquivo. Encaminhe para a Secretaria ou selecione outro arquivo.');
    return;
  }

  // BLOQUEIO 2: Evita cliques duplos simultâneos
  if (!this.arquivoAtestado || this.processandoEnvio) return;

  const usuarioSalvo = JSON.parse(localStorage.getItem('user') || '{}');
  const nomeFinal = nomeAlunoCadastrado || usuarioSalvo.nome || 'Deborah Brito Espindola da Silva';
  const idAluno = usuarioSalvo.id || usuarioSalvo.alunoId || '1'; // Certifique-se de pegar o ID do aluno logado

  this.processandoEnvio = true;
  this.carregandoIa = true;
  this.resultadoIa = null;

  const formData = new FormData();
  formData.append('file', this.arquivoAtestado);
  formData.append('alunoId', idAluno); // Adicionado para gravar na tabela notificacao
  formData.append('nomeAluno', nomeFinal);

  // Endpoint ajustado para salvar no banco de dados
  this.http.post('http://localhost:3000/ai/criar-solicitacao-atestado', formData).subscribe({
    next: (res: any) => {
      this.resultadoIa = res.resultadoIa;
      this.carregandoIa = false;
      this.processandoEnvio = false;

      // VALIDAÇÃO RIGOROSA DOS REQUISITOS (Nome + Dias + Emissão)
      const eAprovado = 
        this.resultadoIa?.nomeConfere &&
        this.resultadoIa?.temDiasAfastamento &&
        this.resultadoIa?.temDataEmissao &&
        this.resultadoIa?.sugestaoAcao === 'APROVAR';

      if (eAprovado) {
        this.tentativasRecusadas = 0;
      } else {
        this.tentativasRecusadas++;
      }

      // Recarrega a lista de acompanhamentos para mostrar a nova solicitação salva no banco
      if (typeof this.carregarNotificacoes === 'function'){
        this.carregarNotificacoes();
      }
      
    },
    error: (err) => {
      console.error('Erro ao processar e salvar a solicitação:', err);
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

    // Mantém o mesmo ID durante todo o fluxo do mesmo atestado para evitar duplicados
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

    // 1. Atualiza diretamente o array da interface (sem criar novas linhas)
    const index = this.notificacoes.findIndex(n => n.id === novaNotificacao.id);
    if (index !== -1) {
      this.notificacoes[index] = novaNotificacao;
    } else {
      this.notificacoes.unshift(novaNotificacao);
    }

    // 2. Persiste na API Backend em segundo plano
    this.http.post('http://localhost:3000/notificacoes', novaNotificacao).subscribe({
      next: () => {
        this.processandoEnvio = false;
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
    this.tentativasRecusadas = 0; // Zera contagem de tentativas
    this.idSolicitacaoAtual = null; // Permite que o próximo arquivo gere uma nova linha

    const inputElement = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (inputElement) {
      inputElement.value = '';
    }
  }

  // ==========================================
  // MÉTODOS AUXILIARES DE PAGINAÇÃO E FILTRO
  // ==========================================
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
        return itemStatus === 'PENDENTE' || itemStatus === '';
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
}