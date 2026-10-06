import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { NotificacoesService, Notificacao } from '../../notificacoes/services/notificacoes.service';
import { Subscription } from 'rxjs';

export interface ItemTabelaResumo {
  alunoNome: string;
  matricula: string;
  turma: string;
  motivo: string;
  dataEnvio: string;
  status: 'Pendente' | 'Aprovada' | 'Rejeitada' | string;
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
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboards.html',
  styleUrl: './dashboards.css'
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
    private readonly router: Router
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

  carregarNotificacoes(): void {
  this.notificacoesService.listarTodasParaSecretaria().subscribe({
    next: (dados) => {
      console.log('Dados recebidos da API na Secretaria:', dados);
      this.notificacoes = dados || [];
    },
    error: (err) => console.error('Erro ao carregar notificações:', err)
  });
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
 // Listas extraídas das notificações reais
  get recebidosRecentemente(): ItemTabelaResumo[] {
    return this.notificacoes.map((n: any) => {
      const analiseResponsavel = (n.tipo === 'ATESTADO' || n.temUpload) 
        ? 'IA' 
        : (n.administrador || 'Pendente (Secretaria)');

      return {
        alunoNome: n.alunoNome || 'Aluno Não Identificado',
        matricula: n.matricula || '2024001',
        turma: n.turma || 'Ensino Médio',
        motivo: n.motivo || 'Sem Motivo',
        dataEnvio: n.dataEnvio ? new Date(n.dataEnvio).toLocaleDateString('pt-BR') : 'Hoje',
        status: n.status || 'Pendente',
        administrador: analiseResponsavel
      };
    });
  }

  get analisesManuais(): ItemTabelaResumo[] {
    return this.recebidosRecentemente.filter(item => 
      item.status.toUpperCase() === 'PENDENTE' || item.status.toUpperCase() === 'REJEITADA'
    );
  }

  // Filtros de busca por Nome ou Matrícula
  get recebidosFiltrados(): ItemTabelaResumo[] {
    if (!this.termoPesquisa.trim()) return this.recebidosRecentemente;
    const termo = this.termoPesquisa.toLowerCase();
    return this.recebidosRecentemente.filter(
      item => item.alunoNome.toLowerCase().includes(termo) || item.matricula.includes(termo)
    );
  }

  get analisesFiltradas(): ItemTabelaResumo[] {
    if (!this.termoPesquisa.trim()) return this.analisesManuais;
    const termo = this.termoPesquisa.toLowerCase();
    return this.analisesManuais.filter(
      item => item.alunoNome.toLowerCase().includes(termo) || item.matricula.includes(termo)
    );
  }

  // Indicadores de KPIs (Calculados Dinamicamente + Variação do Período)
  get kpis(): IndicadoresKPI {
    const total = this.notificacoes.length;
    const pendentes = this.notificacoes.filter(n => n.status?.toUpperCase() === 'PENDENTE').length;
    const aprovadas = this.notificacoes.filter(n => n.status?.toUpperCase() === 'APROVADO').length;
    const recusadas = this.notificacoes.filter(n => n.status?.toUpperCase() === 'REJEITADO').length;

    if (this.periodoSelecionado === 'Últimos 30 dias') {
      return {
        totalJustificativas: total.toString(),
        totalSubtexto: '18% a mais este mês',
        aguardandoAnalise: pendentes.toString(),
        aguardandoSubtexto: 'Agilidade 10% a mais este mês',
        aprovadas: aprovadas.toString(),
        aprovadasSubtexto: '31% a mais este mês',
        recusadas: recusadas.toString(),
        recusadasSubtexto: '-4% este mês'
      };
    } else if (this.periodoSelecionado === 'Últimos 6 meses') {
      return {
        totalJustificativas: total.toString(),
        totalSubtexto: '25% a mais no semestre',
        aguardandoAnalise: pendentes.toString(),
        aguardandoSubtexto: 'Agilidade 15% a mais no semestre',
        aprovadas: aprovadas.toString(),
        aprovadasSubtexto: '35% a mais no semestre',
        recusadas: recusadas.toString(),
        recusadasSubtexto: '-12% no semestre'
      };
    }

    // Padrão: Últimos 7 dias
    return {
      totalJustificativas: total.toString(),
      totalSubtexto: '12% a mais este mês',
      aguardandoAnalise: pendentes.toString(),
      aguardandoSubtexto: 'Agilidade 6% a mais este mês',
      aprovadas: aprovadas.toString(),
      aprovadasSubtexto: '27% a mais este mês',
      recusadas: recusadas.toString(),
      recusadasSubtexto: '-7% este mês'
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

  // Gráfico de Rosquinha
  get motivosAusencia(): MotivosAusencia {
    let gripal = 56;
    let odonto = 30;
    let outros = 14;

    if (this.periodoSelecionado === 'Últimos 30 dias') {
      gripal = 42;
      odonto = 38;
      outros = 20;
    } else if (this.periodoSelecionado === 'Últimos 6 meses') {
      gripal = 65;
      odonto = 20;
      outros = 15;
    }

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
}