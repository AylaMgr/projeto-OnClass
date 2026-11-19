import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificacoesService, Notificacao } from '../../notificacoes/services/notificacoes.service';
import { Subscription } from 'rxjs';
import { TopBarComponent } from '../../../shared/components/top-bar/top-bar.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { FilterBarComponent, FiltroDropdown } from '../../../shared/components/filter-bar/filter-bar.component';

export interface ItemTabelaResumo {
  id: string;
  alunoNome: string;
  matricula: string;
  turma: string;
  motivo: string;
  dataEnvio: string;
  horarioEnvio: string;
  status: 'Pendente' | 'Aprovada' | 'Rejeitada' | string;
  analisadoPor?: string;
}

export interface IndicadoresKPI {
  totalJustificativas: string;
  totalSubtexto: string;
  aguardandoAnalise: string;
  aguardandoSubtexto: string;
  aprovadas: string;
  aprovadasSubtexto: string;
  recusadas: string;
  recusadasSubtexto: string;
}

export interface MotivosAusencia {
  gripalPct: number;
  odontoPct: number;
  outrosPct: number;
  dashGripal: string;
  dashOdonto: string;
  offsetOdonto: number;
  dashOutros: string;
  offsetOutros: number;
}

@Component({
  selector: 'app-dashboards',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TopBarComponent,
    StatusBadgeComponent,
    FilterBarComponent
  ],
  templateUrl: './dashboardS.html',
  styleUrl: './dashboardS.css'
})
export class Dashboards implements OnInit, OnDestroy {
  notificacoes: Notificacao[] = [];
  private notificacoesSubscription!: Subscription;

  termoPesquisa: string = '';
  periodoSelecionado: string = 'Últimos 7 dias';
  opcoesPeriodo: string[] = ['Últimos 7 dias', 'Últimos 30 dias', 'Últimos 6 meses'];
  menuPeriodoAberto: boolean = false;

  solicitacaoSelecionada: Notificacao | null = null;

  constructor(
    private readonly notificacoesService: NotificacoesService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarNotificacoes();
    this.notificacoesSubscription = this.notificacoesService.notificacaoCriada$.subscribe(() => {
      this.carregarNotificacoes();
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

  carregarNotificacoes(): void {
    this.notificacoesService.listarTodasParaSecretaria().subscribe({
      next: (dados) => {
        this.notificacoes = dados || [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao carregar notificações na Secretaria:', err)
    });
  }

  // Navega diretamente para a análise detalhada do atestado selecionado
  abrirSolicitacao(item: ItemTabelaResumo): void {
    if (item?.id) {
      this.router.navigate(['/secretaria/solicitacoes', item.id]);
    }
  }

  // Navegações e Menu
  verHistoricoRecentes(): void {
    this.router.navigate(['/secretaria/analises-manuais'], { queryParams: { aba: 'recentes' } });
  }

  verAnalisesManuais(): void {
    this.router.navigate(['/secretaria/analises-manuais']);
  }

  voltar(): void {
    this.router.navigate(['/login']);
  }

  alternarMenuPeriodo(): void {
    this.menuPeriodoAberto = !this.menuPeriodoAberto;
  }

  selecionarPeriodo(opcao: string): void {
    this.periodoSelecionado = opcao;
    this.menuPeriodoAberto = false;
  }

  // Modal de Detalhes
  abrirDetalhes(item: Notificacao): void {
    this.solicitacaoSelecionada = item;
  }

  fecharDetalhes(): void {
    this.solicitacaoSelecionada = null;
  }

  // Listas extraídas das notificações reais
  get recebidosRecentemente(): ItemTabelaResumo[] {
    return this.notificacoes.map((n: any) => {
      const statusNorm = this.normalizarStatus(n.status);
      const descricaoTexto = n.descricao || '';
      const motivoTexto = n.motivo || 'Sem Motivo';

      const ehAprovado =
        statusNorm === 'APROVADA' ||
        statusNorm === 'APROVADO' ||
        statusNorm === 'ENCAMINHADO_PROFESSOR' ||
        statusNorm.includes('CONCLU') ||
        statusNorm.includes('DEFINITIVAMENTE');

      const ehRejeitado = statusNorm.includes('REJEIT') || statusNorm.includes('RECUS');

      const analiseResponsavel =
        n.administrador ||
        (ehAprovado && statusNorm !== 'ENCAMINHADO_PROFESSOR' ? 'IA OnClass' : 'Secretaria');

      let statusFinal = 'Pendente';
      if (statusNorm === 'ENCAMINHADO_PROFESSOR') statusFinal = 'Encaminhado';
      else if (ehAprovado) statusFinal = 'Concluído';
      else if (ehRejeitado) statusFinal = 'Rejeitada';

      const nomePacienteDesc =
        this.extrairCampoDescricao(descricaoTexto, 'Paciente') ||
        this.extrairCampoDescricao(descricaoTexto, 'Nome Lido');

      const dataRaw = n.createdAt || n.criadoEm || n.dataEnvio;
      const dataObj = dataRaw ? new Date(dataRaw) : null;
      const dataValida = dataObj && !isNaN(dataObj.getTime());

      return {
        id: String(n.id || n._id || ''),
        alunoNome: n.alunoNome || n.aluno?.nome || nomePacienteDesc || 'Aluno Não Identificado',
        matricula: n.matricula || n.alunoMatricula || n.aluno?.matricula || 'N/I',
        turma: n.turma || n.aluno?.turma || n.aluno?.turmas?.[0] || 'Ensino Médio',
        motivo: motivoTexto,
        dataEnvio: dataValida ? dataObj!.toLocaleDateString('pt-BR') : 'Hoje',
        horarioEnvio: dataValida
          ? dataObj!.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          : '--:--',
        status: statusFinal,
        analisadoPor: analiseResponsavel
      };
    }).slice(0, 5);
  }

  get analisesManuais(): ItemTabelaResumo[] {
    return this.recebidosRecentemente.filter(item =>
      item.status.toUpperCase() === 'PENDENTE'
    );
  }

  // Filtros de busca por Nome ou Matrícula
  get recebidosFiltrados(): ItemTabelaResumo[] {
    if (!this.termoPesquisa.trim()) return this.recebidosRecentemente;
    const termo = this.termoPesquisa.toLowerCase();
    return this.recebidosRecentemente.filter(
      item => item.alunoNome.toLowerCase().includes(termo) || item.matricula.toLowerCase().includes(termo)
    );
  }

  get analisesFiltradas(): ItemTabelaResumo[] {
    if (!this.termoPesquisa.trim()) return this.analisesManuais;
    const termo = this.termoPesquisa.toLowerCase();
    return this.analisesManuais.filter(
      item => item.alunoNome.toLowerCase().includes(termo) || item.matricula.toLowerCase().includes(termo)
    );
  }

  // Indicadores de KPIs (Calculados Dinamicamente com base nos status reais)
  get kpis(): IndicadoresKPI {
    const total = this.notificacoes.length;

    const pendentes = this.notificacoes.filter(n => {
      const s = this.normalizarStatus(n.status);
      return s === 'PENDENTE' || s === '' || s.includes('SECRETARIA') || s.includes('ANALISE');
    }).length;

    const aprovados = this.notificacoes.filter(n => {
      const s = this.normalizarStatus(n.status);
      return s === 'APROVADA' || s === 'APROVADO' || s === 'ENCAMINHADO_PROFESSOR' || s.includes('CONCLU');
    }).length;

    const recusados = this.notificacoes.filter(n => {
      const s = this.normalizarStatus(n.status);
      return s.includes('REJEIT') || s.includes('RECUS');
    }).length;

    return {
      totalJustificativas: total.toString(),
      totalSubtexto: `${this.periodoSelecionado}`,
      aguardandoAnalise: pendentes.toString(),
      aguardandoSubtexto: pendentes === 1 ? '1 pedido na fila' : `${pendentes} pedidos na fila`,
      aprovadas: aprovados.toString(),
      aprovadasSubtexto: total > 0 ? `${Math.round((aprovados / total) * 100)}% do total` : '0% do total',
      recusadas: recusados.toString(),
      recusadasSubtexto: total > 0 ? `${Math.round((recusados / total) * 100)}% do total` : '0% do total'
    };
  }

  // Gráfico de Linhas (Eixo X)
  get eixoX(): string[] {
    if (this.periodoSelecionado === 'Últimos 30 dias') {
      return ['Dia 1', 'Dia 5', 'Dia 10', 'Dia 15', 'Dia 20', 'Dia 25', 'Dia 30'];
    } else if (this.periodoSelecionado === 'Últimos 6 meses') {
      return ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    }
    return ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  }

  // Gráfico de Linhas (Pontos SVG)
  get pontosGrafico(): string {
    if (this.periodoSelecionado === 'Últimos 30 dias') {
      return '0,80 16.6,65 33.3,40 50,55 66.6,30 83.3,50 100,20';
    } else if (this.periodoSelecionado === 'Últimos 6 meses') {
      return '0,90 20,70 40,50 60,35 80,45 100,15';
    }
    return '0,75 16.6,60 33.3,70 50,40 66.6,60 83.3,45 100,30';
  }

  // Gráfico de Rosquinha calculado a partir das notificações reais
  get motivosAusencia(): MotivosAusencia {
    const total = this.notificacoes.length;
    if (total === 0) {
      return {
        gripalPct: 0,
        odontoPct: 0,
        outrosPct: 0,
        dashGripal: '0, 100',
        dashOdonto: '0, 100',
        offsetOdonto: 0,
        dashOutros: '0, 100',
        offsetOutros: 0
      };
    }

    let qtdOdonto = 0;
    let qtdOutros = 0;
    let qtdMedico = 0;

    for (const n of this.notificacoes) {
      const m = (n.motivo || '').toLowerCase();
      if (m.includes('odonto')) qtdOdonto++;
      else if (m.includes('outro') || m.includes('pessoal') || m.includes('luto')) qtdOutros++;
      else qtdMedico++;
    }

    const gripal = Math.round((qtdMedico / total) * 100);
    const odonto = Math.round((qtdOdonto / total) * 100);
    const outros = Math.max(0, 100 - gripal - odonto);

    return {
      gripalPct: gripal,
      odontoPct: odonto,
      outrosPct: outros,
      dashGripal: `${gripal}, 100`,
      dashOdonto: `${odonto}, 100`,
      offsetOdonto: -gripal,
      dashOutros: `${outros}, 100`,
      offsetOutros: -(gripal + odonto)
    };
  }

  get filtrosPeriodo(): FiltroDropdown[] {
    return [
      {
        chave: 'periodo',
        label: 'Período',
        valorSelecionado: this.periodoSelecionado,
        opcoes: this.opcoesPeriodo.map(op => ({ label: op, valor: op }))
      }
    ];
  }

  onPeriodoChange(evento: { chave: string; valor: string }): void {
    this.selecionarPeriodo(evento.valor);
  }
}