import { Component, OnInit, OnDestroy, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { NotificacoesService } from '../../notificacoes/services/notificacoes.service';

export interface SolicitacaoAluno {
  id: string | number;
  matricula?: string;
  aluno?: string;
  nomeAluno?: string;
  alunoId?: string | number;
  motivo: string;
  dataEnvio?: string;
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
      if (dados && dados.length > 0) {
        this.solicitacoes = dados.map((item) => {
          const statusOriginal = item.status || '';
          const motivoTexto = item.motivo || item.descricao || '';

          // Regra: Se o status for de aprovação OU se for um atestado de IA (contém '(IA)')
          const ehAprovado = 
            statusOriginal === 'Solicitação Aprovada Definitivamente' ||
            statusOriginal.toLowerCase().includes('aprov') ||
            statusOriginal.toLowerCase().includes('conclu') ||
            motivoTexto.includes('(IA)'); // 👈 Força atestados de IA como aprovados/concluídos

          return {
            id: item.id,
            matricula: item.matricula || item.alunoMatricula || '2024001234',
            aluno: item.alunoNome || item.aluno?.nome || 'Aluno Não Identificado',
            motivo: motivoTexto || 'Solicitação de Abono',
            dataEnvio: item.dataEnvio || item.createdAt || 'Hoje',
            // Define 'Concluído' para aprovados/IA e mantém 'Pendente' para os restantes
            status: ehAprovado ? 'Concluído' : 'Pendente',
            turno: item.turno || item.aluno?.turno || 'Matutino',
            turma: item.turma || item.aluno?.turma || 'Ensino Médio',
            administrador: item.administrador || (ehAprovado ? 'IA OnClass' : 'Secretaria'),
          };
        });
      } else {
        this.solicitacoes = this.obterDadosFicticios();
      }

      this.carregando = false;
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('Erro ao carregar solicitações para a Secretaria:', err);
      this.solicitacoes = this.obterDadosFicticios();
      this.carregando = false;
      this.cdr.detectChanges();
    },
  });
}

// Método auxiliar com os dados fictícios
private obterDadosFicticios(): SolicitacaoAluno[] {
  return [
    {
      id: 1,
      matricula: '2024001234',
      aluno: 'Lucas Silva Pereira',
      motivo: 'Tratamento Médico (IA)',
      dataEnvio: '27/10/2026, 09:35',
      status: 'Pendente',
      turno: 'Matutino',
      turma: '3º Ano A',
      administrador: 'Secretaria',
    },
    {
      id: 2,
      matricula: '2024005678',
      aluno: 'Beatriz Maria Santos',
      motivo: 'Consulta Médica / Exames',
      dataEnvio: '27/10/2026, 10:09',
      status: 'Solicitação Aprovada Definitivamente',
      turno: 'Vespertino',
      turma: '2º Ano B',
      administrador: 'IA OnClass',
    },
    {
      id: 3,
      matricula: '2024009988',
      aluno: 'Gabriel Oliveira Costa',
      motivo: 'Tratamento Odontológico',
      dataEnvio: '26/10/2026, 18:37',
      status: 'Rejeitado',
      turno: 'Noturno',
      turma: '1º Ano C',
      administrador: 'Secretaria',
    },
  ];
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
    const atendeMatricula = !this.termoMatricula || 
      (item.matricula?.includes(this.termoMatricula) ?? false);
    
    const atendeTurno = !this.turnoSelecionado || item.turno === this.turnoSelecionado;
    const atendeTurma = !this.turmaSelecionada || item.turma === this.turmaSelecionada;

    return atendeMatricula && atendeTurno && atendeTurma;
  });

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