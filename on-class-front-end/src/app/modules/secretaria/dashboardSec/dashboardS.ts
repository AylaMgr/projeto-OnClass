import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AnalisesManuais } from '../analisesManuais/analisesManuais';

export interface ItemTabelaResumo {
  alunoNome: string;
  matricula: string;
  turma: string;
  motivo: string;
  dataEnvio: string;
  status: 'Pendente' | 'Aprovada' | 'Rejeitada';
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
  // Valores calculados para o SVG do gráfico circular
  dashGripal: string;
  dashOdonto: string;
  offsetOdonto: number;
  dashOutros: string;
  offsetOutros: number;
}

@Component({
  selector: 'app-dashboard-s',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboardS.html',
  styleUrl: './dashboardS.css'
})
export class DashboardS {
  termoPesquisa: string = '';

  periodoSelecionado: string = 'Últimos 7 dias';
  opcoesPeriodo: string[] = ['Últimos 7 dias', 'Últimos 30 dias', 'Últimos 6 meses'];
  menuPeriodoAberto: boolean = false;

  recebidosRecentemente: ItemTabelaResumo[] = [
    {
      alunoNome: 'Guilherme Santos',
      matricula: '2024001',
      turma: '8º Ano A - Matutino',
      motivo: 'Consulta Pediátrica',
      dataEnvio: 'Hoje, 09h41',
      status: 'Pendente'
    },
    {
      alunoNome: 'Mariana Souza',
      matricula: '2024002',
      turma: '3º Ano B - Vespertino',
      motivo: 'Sintomas Gripais',
      dataEnvio: 'Ontem, 16h20',
      status: 'Aprovada'
    }
  ];

  analisesManuais: ItemTabelaResumo[] = [
    {
      alunoNome: 'Guilherme Santos',
      matricula: '2024001',
      turma: '8º Ano A - Matutino',
      motivo: 'Consulta Pediátrica',
      dataEnvio: 'Hoje, 09h41',
      status: 'Rejeitada'
    },
    {
      alunoNome: 'Mariana Souza',
      matricula: '2024002',
      turma: '3º Ano B - Vespertino',
      motivo: 'Sintomas Gripais',
      dataEnvio: 'Ontem, 16h20',
      status: 'Rejeitada'
    }
  ];

  constructor(private router: Router) {}

  // Navega para a tela de solicitações abrindo diretamente na aba 'recentes'
  verHistoricoRecentes(): void {
  this.router.navigate(['/secretaria/analises-manuais'], { queryParams: { aba: 'recentes' } });
}

  // Navega para a tela de solicitações abrindo na aba 'manuais'
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

  // 1. Dados dos Cards de KPIs baseados no período
  get kpis(): IndicadoresKPI {
    if (this.periodoSelecionado === 'Últimos 30 dias') {
      return {
        totalJustificativas: '4.850',
        totalSubtexto: '18% a mais este mês',
        aguardandoAnalise: '142',
        aguardandoSubtexto: 'Agilidade 10% a mais este mês',
        aprovadas: '3.900',
        aprovadasSubtexto: '31% a mais este mês',
        recusadas: '808',
        recusadasSubtexto: '-4% este mês'
      };
    } else if (this.periodoSelecionado === 'Últimos 6 meses') {
      return {
        totalJustificativas: '28.400',
        totalSubtexto: '25% a mais no semestre',
        aguardandoAnalise: '210',
        aguardandoSubtexto: 'Agilidade 15% a mais no semestre',
        aprovadas: '23.800',
        aprovadasSubtexto: '35% a mais no semestre',
        recusadas: '4.390',
        recusadasSubtexto: '-12% no semestre'
      };
    }
    // Padrão: Últimos 7 dias
    return {
      totalJustificativas: '1.200',
      totalSubtexto: '12% a mais este mês',
      aguardandoAnalise: '37',
      aguardandoSubtexto: 'Agilidade 6% a mais este mês',
      aprovadas: '1.600',
      aprovadasSubtexto: '27% a mais este mês',
      recusadas: '500',
      recusadasSubtexto: '-7% este mês'
    };
  }

  // 2. Etiquetas do Eixo X do gráfico de linhas
  get eixoX(): string[] {
    if (this.periodoSelecionado === 'Últimos 30 dias') {
      return ['Dia 1', 'Dia 5', 'Dia 10', 'Dia 15', 'Dia 20', 'Dia 25', 'Dia 30'];
    } else if (this.periodoSelecionado === 'Últimos 6 meses') {
      return ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    }
    return ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  }

  // 3. Pontos SVG do gráfico de linha
  get pontosGrafico(): string {
    if (this.periodoSelecionado === 'Últimos 30 dias') {
      return '0,80 16.6,65 33.3,40 50,55 66.6,30 83.3,50 100,20';
    } else if (this.periodoSelecionado === 'Últimos 6 meses') {
      return '0,90 20,70 40,50 60,35 80,45 100,15';
    }
    return '0,75 16.6,60 33.3,70 50,40 66.6,60 83.3,45 100,30';
  }

  // 4. Estatísticas do Gráfico de Rosquinha (Motivos de Ausência)
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

  // Filtros de pesquisa por nome/matrícula
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
}