import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CriarNotificacao } from '../../criar-notificacao/criar-notificacao';
import { NotificacoesService, Notificacao } from '../../notificacoes/services/notificacoes.service';
import { TopBarComponent } from '../../../shared/components/top-bar/top-bar.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { FilterBarComponent, FiltroDropdown } from '../../../shared/components/filter-bar/filter-bar.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CriarNotificacao,
    TopBarComponent,
    StatusBadgeComponent,
    FilterBarComponent
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  termoPesquisa: string = '';
  mostrarFormulario: boolean = false;
  notificacoes: Notificacao[] = [];
  arquivoAtestado: File | null = null;
  carregandoIa: boolean = false;
  processandoEnvio: boolean = false;
  resultadoIa: any = null;

  // Campos extraídos pela IA para o formulário estruturado
  nomeExtraidoIa: string = 'N/I';
  afastamentoExtraidoIa: string = 'N/I';
  medicoExtraidoIa: string = 'N/I';
  crmExtraidoIa: string = 'N/I';
  cidExtraidoIa: string = 'N/I';
  dataInicioExtraidaIa: string = '';
  dataFimExtraidaIa: string = '';
  parecerIa: string = 'Análise automática realizada por IA.';

  notificacaoSelecionada: Notificacao | null = null;
  tentativasRecusadas: number = 0;

  filtroStatus: string = 'TODOS';
  paginaAtual: number = 1;
  itensPorPagina: number = 5;

  filtrosStatusAluno: FiltroDropdown[] = [
    {
      chave: 'status',
      label: 'Todos',
      valorSelecionado: 'TODOS',
      opcoes: [
        { label: 'Todos', valor: 'TODOS' },
        { label: 'Pendentes', valor: 'PENDENTE' },
        { label: 'Aprovados', valor: 'APROVADO' },
        { label: 'Rejeitados', valor: 'REJEITADO' }
      ]
    }
  ];

  constructor(
    private readonly notificacoesService: NotificacoesService,
    private readonly authService: AuthService,
    private readonly http: HttpClient,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.carregarNotificacoes();
    this.notificacoesService.notificacaoCriada$.subscribe(() => {
      this.reiniciarAnalise();
      this.carregarNotificacoes();
    });
  }

  private normalizarStatus(statusRaw: any): string {
    if (!statusRaw) return '';
    return String(statusRaw)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .trim();
  }

  getStatusClass(statusRaw: string): string {
    const status = this.normalizarStatus(statusRaw);
    if (status === 'ENCAMINHADO_PROFESSOR') {
      return 'status-pendente';
    }
    if (status.includes('APROV') || status.includes('CONCLU')) {
      return 'status-aprovado';
    }
    if (status.includes('REJEIT') || status.includes('RECUS')) {
      return 'status-rejeitado';
    }
    return 'status-pendente';
  }

  obterTextoStatus(statusRaw: string): string {
    const status = this.normalizarStatus(statusRaw);
    if (status === 'ENCAMINHADO_PROFESSOR') {
      return 'Em Análise pelo Professor';
    }
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
    return (item.tipo === 'ATESTADO' || item.temUpload || item.arquivoUrl || item.arquivoNome) ? 'IA' : 'Secretaria';
  }

  abrirDetalhes(item: Notificacao): void {
    this.notificacaoSelecionada = item;
  }

  fecharDetalhes(): void {
    this.notificacaoSelecionada = null;
  }

  onFiltroStatusChange(evento: { chave: string; valor: string }): void {
    this.filtrarPorStatus(evento.valor);
  }

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
        return (
          itemStatus !== 'ENCAMINHADO_PROFESSOR' &&
          (itemStatus.includes('APROV') || itemStatus.includes('CONCLU') || itemStatus.includes('DEFINITIVAMENTE'))
        );
      }
      if (filtro === 'REJEITADO') {
        return itemStatus.includes('REJEIT') || itemStatus.includes('RECUS');
      }
      if (filtro === 'PENDENTE') {
        return (
          itemStatus === 'ENCAMINHADO_PROFESSOR' ||
          itemStatus.includes('PENDENTE') ||
          itemStatus.includes('SECRETARIA') ||
          itemStatus.includes('ANALISE')
        );
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

private obterDadosAlunoLogado(): { id: string; nome: string; matricula: string } {
    const info = this.authService.getUserInfo();
    if (info && info.id) {
      return {
        id: info.id,
        nome: info.nome,
        matricula: info.matricula,
      };
    }
    return { id: '', nome: '', matricula: '' };
  }
  
  private getAuthHeaders(): HttpHeaders {
  const token = this.authService.getToken();
  return token
    ? new HttpHeaders({ Authorization: `Bearer ${token}` })
    : new HttpHeaders();
}

  private gerarPastaAluno(): string {
    const aluno = this.obterDadosAlunoLogado();
    const nomeLimpo = (aluno.nome || 'aluno')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_-]/g, '');

    const matriculaLimpa = (aluno.matricula || 'geral')
      .trim()
      .replace(/[^a-zA-Z0-9_-]/g, '');

    return `alunos/${nomeLimpo}_${matriculaLimpa}`;
  }

  /**
   * Renomeia o arquivo com a Data e Hora exatas em que foi encaminhado (AAAA-MM-DD_HH-mm-ss.ext)
   */
  private renomearArquivoComDataHora(arquivo: File): File {
    const agora = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const dataStr = `${agora.getFullYear()}-${pad(agora.getMonth() + 1)}-${pad(agora.getDate())}`;
    const horaStr = `${pad(agora.getHours())}-${pad(agora.getMinutes())}-${pad(agora.getSeconds())}`;

    const pontoIdx = arquivo.name.lastIndexOf('.');
    const extensao = pontoIdx !== -1 ? arquivo.name.substring(pontoIdx) : '.pdf';
    const novoNome = `${dataStr}_${horaStr}${extensao}`;

    return new File([arquivo], novoNome, {
      type: arquivo.type,
      lastModified: agora.getTime()
    });
  }

  enviarAtestadoParaIa(nomeAlunoCadastrado?: string): void {
    if (!this.arquivoAtestado || this.carregandoIa) return;

    const usuarioSalvo = this.obterDadosAlunoLogado();
    const nomeFinal = nomeAlunoCadastrado || usuarioSalvo.nome || '';
    const idAluno = String(usuarioSalvo.id || '');
    const pastaAluno = this.gerarPastaAluno();

    // Renomeia o arquivo com a data e hora do envio e identifica a pasta do aluno
    const arquivoRenomeado = this.renomearArquivoComDataHora(this.arquivoAtestado);
    this.arquivoAtestado = arquivoRenomeado;

    this.carregandoIa = true;
    this.resultadoIa = null;

    const formData = new FormData();
    formData.append('file', arquivoRenomeado);
    if (idAluno) formData.append('alunoId', idAluno);
    if (nomeFinal) formData.append('nomeAluno', nomeFinal);
    formData.append('pastaDestino', pastaAluno);
    formData.append('nomeArquivoRenomeado', arquivoRenomeado.name);

    this.http
      .post<any>('http://localhost:3000/notificacoes/upload-atestado', formData, {
        headers: this.getAuthHeaders(),
      })
      .subscribe({
        next: (res: any) => {
          const ia = res.analyseIa || res.analiseIA || res.resultadoIa || res;
          this.carregandoIa = false;

          // Recolhe todas as informações extraídas do atestado
          this.nomeExtraidoIa = ia.nomeEncontrado || ia.nomePaciente || ia.nomeLido || ia.nome || nomeFinal || 'N/I';
          this.afastamentoExtraidoIa = ia.datasAfastamento || ia.periodoAfastamento || ia.afastamento || ia.diasAfastamento || '1 dia';
          this.medicoExtraidoIa = ia.medico || ia.nomeMedico || 'N/I';
          this.crmExtraidoIa = ia.crm || 'N/I';
          this.cidExtraidoIa = ia.cid || ia.cid10 || 'N/I';
          this.dataInicioExtraidaIa = ia.dataInicio || '';
          this.dataFimExtraidaIa = ia.dataFim || ia.dataInicio || '';
          this.parecerIa = ia.relatorioSecretaria || ia.parecer || ia.resumo || 'Análise realizada por IA.';

          const iaAprovou = ia.sugestaoAcao === 'APROVAR' || ia.sugestao === 'APROVAR' || ia.acao === 'APROVAR';
          const dadosValidos = this.nomeExtraidoIa !== 'N/I' && this.afastamentoExtraidoIa !== 'N/I';
          const atestadoVeridico = iaAprovou && dadosValidos;

          this.resultadoIa = {
            ...ia,
            atestadoId: res.atestadoId || ia.atestadoId || '',
            arquivoSalvo: `${pastaAluno}/${arquivoRenomeado.name}`,
            valido: atestadoVeridico,
            sugestaoAcao: atestadoVeridico ? 'APROVAR' : 'REJEITAR',
            status: atestadoVeridico ? 'APROVADA' : 'PENDENTE',
            periodo: this.afastamentoExtraidoIa,
            assinaturaMedica: this.medicoExtraidoIa !== 'N/I'
              ? `${this.medicoExtraidoIa}${this.crmExtraidoIa !== 'N/I' ? ' - CRM ' + this.crmExtraidoIa : ''}`
              : (atestadoVeridico ? 'Verificada' : 'Divergente / Não Verificada'),
            nomeLido: this.nomeExtraidoIa,
            mensagem: atestadoVeridico
              ? 'Atestado verídico validado com status Aprovado e encaminhado à Secretaria!'
              : 'Não foi possível validar automaticamente. Escolha enviar para análise manual da Secretaria (Status: Pendente).',
          };

          // Atualiza imediatamente a tabela "Acompanhamentos Recentemente" do aluno
          this.carregarNotificacoes();
        },
        error: (err: any) => {
          console.error('Erro ao processar atestado com a IA:', err);
          this.carregandoIa = false;
          alert(err?.error?.message || 'Ocorreu um erro ao conectar com o servidor de IA.');
        },
      });
  }

  private salvarJustificativaComAnexo(
    statusBackend: 'APROVADA' | 'PENDENTE',
    exibirAlertaSecretaria = false,
  ): void {
    if (exibirAlertaSecretaria || statusBackend === 'PENDENTE') {
      alert('Atestado encaminhado para análise manual da Secretaria com status Pendente.');
    }
    this.resultadoIa = null;
    this.arquivoAtestado = null;
    this.carregarNotificacoes();
  }

  carregarNotificacoes(): void {
    const userAtual = this.obterDadosAlunoLogado();
    const meuId = userAtual.id;

    // Se não houver ID do aluno logado, não exibe solicitações de terceiros
    if (!meuId) {
      this.notificacoes = [];
      return;
    }

    this.notificacoesService.listarPorAluno(meuId).subscribe({
      next: (dados: any[]) => {
        const lista = Array.isArray(dados) ? dados : [];
        const minhasNotificacoes = lista.filter(
          (item) => String(item.alunoId) === meuId
        );

        this.notificacoes = minhasNotificacoes.map((item: any) => ({
          ...item,
          status: this.normalizarStatus(item.status),
          dataInicio: item.dataInicio || item.dataEnvio,
          dataFim: item.dataFim || item.dataEnvio,
          administrador:
            item.administrador ||
            (item.tipo === 'ATESTADO' || item.atestadoId ? 'IA OnClass' : 'Secretaria'),
        }));
      },
      error: (err: any) => {
        console.error('Erro ao carregar notificações do aluno:', err);
      },
    });
  }

  confirmarEnvioAprovado(): void {
    this.salvarJustificativaComAnexo('APROVADA', false);
  }

  enviarParaSecretariaPendente(): void {
    this.salvarJustificativaComAnexo('PENDENTE', true);
  }

  reiniciarAnalise(): void {
    this.arquivoAtestado = null;
    this.resultadoIa = null;
    this.carregandoIa = false;
    this.tentativasRecusadas = 0;
    this.mostrarFormulario = false;
    this.nomeExtraidoIa = 'N/I';
    this.afastamentoExtraidoIa = 'N/I';
    this.medicoExtraidoIa = 'N/I';
    this.crmExtraidoIa = 'N/I';
    this.cidExtraidoIa = 'N/I';
    this.dataInicioExtraidaIa = '';
    this.dataFimExtraidaIa = '';
    this.parecerIa = 'Análise automática realizada por IA.';
  }

  voltar(): void {
    this.router.navigate(['/login']);
  }
}