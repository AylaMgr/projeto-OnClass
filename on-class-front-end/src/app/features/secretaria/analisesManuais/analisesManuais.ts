import { Component, OnInit, OnDestroy, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { NotificacoesService } from '../../notificacoes/services/notificacoes.service';

export interface SolicitacaoAluno {
  id: string;
  matricula: string;
  aluno: string;
  motivo: string;
  dataEnvio: string;
  status: string;
  turno: string;
  turma: string;
  administrador?: string;
}

@Component({
  selector: 'app-analises-manuais',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './analisesManuais.html',
  styleUrl: './analisesManuais.css'
})
export class AnalisesManuais implements OnInit, OnDestroy {
  termoMatricula: string = '';
  turnoSelecionado: string = '';
  ordemSelecionada: string = '';
  turmaSelecionada: string = '';
  dropdownAberto: string | null = null;

  // Lista dinâmica vinda do backend NestJS/Prisma
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

  carregarSolicitacoes(): void {
    this.carregando = true;
    this.notificacoesService.listarTodasParaSecretaria().subscribe({
      next: (dados: any[]) => {
        // Mapeia os dados do banco para o modelo esperado pela interface da Secretaria
        this.solicitacoes = (dados || []).map(item => ({
          id: item.id,
          matricula: item.matricula || item.alunoMatricula || '2024001234',
          aluno: item.alunoNome || item.aluno?.nome || 'Aluno Não Identificado',
          motivo: item.motivo || item.descricao || 'Solicitação de Abono',
          dataEnvio: item.dataEnvio 
            ? new Date(item.dataEnvio).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            : 'Hoje',
          status: item.status || 'Pendente',
          turno: item.turno || item.aluno?.turno || 'Matutino',
          turma: item.turma || item.aluno?.turma || 'Ensino Médio',
          administrador: item.administrador || 'Secretaria'
        }));

        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar solicitações para a Secretaria:', err);
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
    let resultado = this.solicitacoes.filter(item => {
      const atendeMatricula = !this.termoMatricula || item.matricula.includes(this.termoMatricula);
      const atendeTurno = !this.turnoSelecionado || item.turno === this.turnoSelecionado;
      const atendeTurma = !this.turmaSelecionada || item.turma === this.turmaSelecionada;

      return atendeMatricula && atendeTurno && atendeTurma;
    });

    // Ordenação por recenticidade se selecionada
    if (this.ordemSelecionada === 'antigos') {
      resultado = [...resultado].reverse();
    }

    return resultado;
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