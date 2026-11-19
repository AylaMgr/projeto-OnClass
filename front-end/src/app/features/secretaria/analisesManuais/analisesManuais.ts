import { Component, OnInit, OnDestroy, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { NotificacoesService } from '../../notificacoes/services/notificacoes.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { TopBarComponent } from '../../../shared/components/top-bar/top-bar.component';
import { FiltroDropdown, FilterBarComponent } from '../../../shared/components/filter-bar/filter-bar.component';

export interface SolicitacaoAluno {
  id: string | number;
  matricula?: string;
  aluno?: string;
  nomeAluno?: string;
  alunoId?: string | number;
  motivo: string;
  descricao?: string;
  arquivoPasta?: string;
  dataEnvio: string;
  criadoEm?: string | Date;
  createdAt?: string | Date;
  status: string;
  turno?: string;
  turma?: string;
  administrador?: string;
}

@Component({
  selector: 'app-analises-manuais',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    StatusBadgeComponent,
    TopBarComponent,
    FilterBarComponent
  ],
  templateUrl: './analisesManuais.html',
  styleUrl: './analisesManuais.css'
})
export class AnalisesManuais implements OnInit, OnDestroy {
  termoMatricula: string = '';
  turnoSelecionado: string = '';
  ordemSelecionada: string = '';
  turmaSelecionada: string = '';
  dropdownAberto: string | null = null;

  // Lista dinâmica vinda exclusivamente do backend NestJS / MongoDB Atlas
  solicitacoes: SolicitacaoAluno[] = [];
  carregando: boolean = true;

  private notificacoesSubscription!: Subscription;

  constructor(
    private readonly router: Router,
    private readonly notificacoesService: NotificacoesService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarSolicitacoes();

    // Escuta atualizações em tempo real enviadas pelo perfil do aluno
    this.notificacoesSubscription = this.notificacoesService.notificacaoCriada$.subscribe(() => {
      this.carregarSolicitacoes();
    });
  }

  ngOnDestroy(): void {
    if (this.notificacoesSubscription) {
      this.notificacoesSubscription.unsubscribe();
    }
  }

  private normalizarStatus(statusRaw: any): string {
    if (!statusRaw) return '';
    return String(statusRaw)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .trim();
  }

  private extrairCampoDescricao(descricao: string, chave: string): string {
    if (!descricao) return '';
    const regex = new RegExp(`${chave}:\\s*([^|]+)`, 'i');
    const match = descricao.match(regex);
    return match ? match[1].trim() : '';
  }

  private formatarDataHora(dataRaw: any): string {
    if (!dataRaw) return '-';
    const d = new Date(dataRaw);
    if (isNaN(d.getTime())) return String(dataRaw);
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  carregarSolicitacoes(): void {
    this.carregando = true;
    this.notificacoesService.listarTodasParaSecretaria().subscribe({
      next: (dados: any[]) => {
        if (dados && Array.isArray(dados)) {
          this.solicitacoes = dados.map((item) => {
            const statusNorm = this.normalizarStatus(item.status);
            const descricaoTexto = item.descricao || '';

            // Verifica o estado real do banco (sem forçar aprovação só porque tem '(IA)' no texto)
            const ehAprovado =
              statusNorm === 'APROVADA' ||
              statusNorm === 'APROVADO' ||
              statusNorm.includes('CONCLU') ||
              statusNorm.includes('DEFINITIVAMENTE');

            const ehEncaminhadoProf = statusNorm === 'ENCAMINHADO_PROFESSOR';
            const ehRejeitado = statusNorm.includes('REJEIT') || statusNorm.includes('RECUS');

            let statusExibicao = 'Pendente';
            if (ehAprovado) statusExibicao = 'Concluído';
            else if (ehEncaminhadoProf) statusExibicao = 'Encaminhado ao Professor';
            else if (ehRejeitado) statusExibicao = 'Rejeitado';

            const nomePacienteDesc =
              this.extrairCampoDescricao(descricaoTexto, 'Paciente') ||
              this.extrairCampoDescricao(descricaoTexto, 'Nome Lido');

            const arquivoPasta = this.extrairCampoDescricao(descricaoTexto, 'Arquivo Pasta Aluno');

            const nomeAlunoFinal =
              item.alunoNome ||
              item.aluno?.nome ||
              nomePacienteDesc ||
              'Aluno Não Identificado';

            return {
              id: item.id || item._id,
              alunoId: item.alunoId,
              matricula: item.matricula || item.alunoMatricula || item.aluno?.matricula || 'N/I',
              aluno: nomeAlunoFinal,
              nomeAluno: nomeAlunoFinal,
              motivo: item.motivo || 'Solicitação de Abono',
              descricao: descricaoTexto,
              arquivoPasta,
              dataEnvio: this.formatarDataHora(item.createdAt || item.criadoEm || item.dataEnvio),
              createdAt: item.createdAt || item.criadoEm,
              status: statusExibicao,
              turno: item.turno || item.aluno?.turno || 'Matutino',
              turma: item.turma || item.aluno?.turma || item.aluno?.turmas?.[0] || 'Não informada',
              administrador: item.administrador || (ehAprovado ? 'IA OnClass' : 'Secretaria')
            };
          });
        } else {
          this.solicitacoes = [];
        }

        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar solicitações para a Secretaria:', err);
        this.solicitacoes = [];
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleDropdown(tipo: string, event: Event): void {
    event.stopPropagation();
    this.dropdownAberto = this.dropdownAberto === tipo ? null : tipo;
  }

  selecionarOpcao(tipo: string, valor: string): void {
    if (tipo === 'turno') this.turnoSelecionado = valor;
    if (tipo === 'ordem') this.ordemSelecionada = valor;
    if (tipo === 'turma') this.turmaSelecionada = valor;
    this.dropdownAberto = null;
  }

  obterRotuloOrdem(): string {
    if (this.ordemSelecionada === 'recentes') return 'Mais Recentes';
    if (this.ordemSelecionada === 'antigos') return 'Mais Antigos';
    return 'ORDEM';
  }

  @HostListener('document:click')
  fecharDropdowns(): void {
    this.dropdownAberto = null;
  }

  // Filtro que combina os dados reais com os filtros da tela e ordenação
  get solicitacoesFiltradas(): SolicitacaoAluno[] {
    const termo = this.termoMatricula.trim().toLowerCase();

    const resultado = this.solicitacoes.filter(item => {
      const atendeBusca =
        !termo ||
        (item.matricula?.toLowerCase().includes(termo) ?? false) ||
        (item.aluno?.toLowerCase().includes(termo) ?? false);

      const atendeTurno = !this.turnoSelecionado || item.turno === this.turnoSelecionado;
      const atendeTurma = !this.turmaSelecionada || item.turma === this.turmaSelecionada;

      return atendeBusca && atendeTurno && atendeTurma;
    });

    if (this.ordemSelecionada === 'recentes') {
      return [...resultado].sort((a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    }

    if (this.ordemSelecionada === 'antigos') {
      return [...resultado].sort((a, b) =>
        new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
      );
    }

    return resultado;
  }

  get filtrosSecretaria(): FiltroDropdown[] {
    return [
      {
        chave: 'turno',
        label: 'Turno',
        valorSelecionado: this.turnoSelecionado || '',
        opcoes: [
          { label: 'Todos', valor: '' },
          { label: 'Matutino', valor: 'Matutino' },
          { label: 'Vespertino', valor: 'Vespertino' },
          { label: 'Noturno', valor: 'Noturno' }
        ]
      },
      {
        chave: 'ordem',
        label: 'Ordem',
        valorSelecionado: this.ordemSelecionada || '',
        opcoes: [
          { label: 'Todas', valor: '' },
          { label: 'Mais Recentes', valor: 'recentes' },
          { label: 'Mais Antigos', valor: 'antigos' }
        ]
      },
      {
        chave: 'turma',
        label: 'Turma',
        valorSelecionado: this.turmaSelecionada || '',
        opcoes: [
          { label: 'Todas', valor: '' },
          { label: '1º Ano A', valor: '1º Ano A' },
          { label: '2º Ano A - Manhã', valor: '2º Ano A - Manhã' },
          { label: '3º Ano A', valor: '3º Ano A' }
        ]
      }
    ];
  }

  onFiltroSecretariaChange(evento: { chave: string; valor: string }): void {
    this.selecionarOpcao(evento.chave as any, evento.valor);
  }

  limparFiltros(): void {
    this.termoMatricula = '';
    this.turnoSelecionado = '';
    this.ordemSelecionada = '';
    this.turmaSelecionada = '';
    this.dropdownAberto = null;
  }

  voltarDashboard(): void {
    this.router.navigate(['/secretaria/dashboard']);
  }

  verHistorico(): void {
    // Ação do histórico
  }
}