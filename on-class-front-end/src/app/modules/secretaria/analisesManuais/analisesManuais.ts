import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

export interface SolicitacaoAluno {
  id: string;
  matricula: string;
  aluno: string;
  motivo: string;
  dataEnvio: string;
  status: string;
  turno: string;
  turma: string;
}

@Component({
  selector: 'app-analises-manuais',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './analisesManuais.html',
  styleUrl: './analisesManuais.css'
})
export class AnalisesManuais {

  termoMatricula: string = '';
  turnoSelecionado: string = '';
  ordemSelecionada: string = '';
  turmaSelecionada: string = '';
  dropdownAberto: string | null = null;

  solicitacoes: SolicitacaoAluno[] = [
    {
      id: '1',
      matricula: '2024001234',
      aluno: 'Mariana Souza Santos',
      motivo: 'Solicitação de Abono: Atestado de Casamento',
      dataEnvio: 'Hoje, 14:32',
      status: 'Rejeitada',
      turno: 'Matutino',
      turma: '8º Ano A'
    },
    {
      id: '2',
      matricula: '2024001990',
      aluno: 'Pedro Henrique Alencar',
      motivo: 'Segunda Chamada: Exame Final Física',
      dataEnvio: 'Ontem, 09:15',
      status: 'Rejeitada',
      turno: 'Vespertino',
      turma: '9º Ano B'
    },
    {
      id: '3',
      matricula: '2024001002',
      aluno: 'Clara Regina Mota',
      motivo: 'Ajuste de Matrícula: Tópicos Especiais',
      dataEnvio: '08 Nov 2026',
      status: 'Rejeitada',
      turno: 'Matutino',
      turma: '7º Ano C'
    },
    {
      id: '4',
      matricula: '2024001552',
      aluno: 'Lucas Bezerra da Silva',
      motivo: 'Solicitação de Abono: Atestado Médico',
      dataEnvio: '07 Nov 2026',
      status: 'Rejeitada',
      turno: 'Noturno',
      turma: '8º Ano A'
    }
  ];

  constructor(private readonly router: Router) {}

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

  get solicitacoesFiltradas(): SolicitacaoAluno[] {
    return this.solicitacoes.filter(item => {
      const atendeMatricula = !this.termoMatricula || item.matricula.includes(this.termoMatricula);
      const atendeTurno = !this.turnoSelecionado || item.turno === this.turnoSelecionado;
      const atendeTurma = !this.turmaSelecionada || item.turma === this.turmaSelecionada;

      return atendeMatricula && atendeTurno && atendeTurma;
    });
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