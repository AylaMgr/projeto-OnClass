import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

export interface SolicitacaoProf {
  id: string;
  matricula: string;
  aluno: string;
  turma: string;
  motivo: string;
  dataEnvio: string;
  status: 'Aprovada' | 'Pendente' | 'Em Análise';
}

@Component({
  selector: 'app-dashboard-p',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboardP.html',
  styleUrl: './dashboardP.css'
})
export class DashboardP {
  // Campo de busca
  termoBusca: string = '';

  // Filtros
  filtroTurno: string = '';
  filtroTurma: string = '';
  filtroOrdem: 'recentes' | 'antigos' = 'recentes';

  // Lista mockada de solicitações para o professor
  solicitacoes: SolicitacaoProf[] = [
    {
      id: '1',
      matricula: '2024003310',
      aluno: 'Gabriela Vasconcelos',
      turma: 'Medicina B',
      motivo: 'Atestado Médico - Acompanhamento',
      dataEnvio: '06 Nov 2026',
      status: 'Aprovada'
    },
    {
      id: '2',
      matricula: '2024004412',
      aluno: 'Rodrigo Alves Mendes',
      turma: 'Engenharia A',
      motivo: 'Declaração de Trabalho',
      dataEnvio: '05 Nov 2026',
      status: 'Pendente'
    }
  ];

  get solicitacoesFiltradas(): SolicitacaoProf[] {
    return this.solicitacoes.filter(item => {
      const atendeBusca = this.termoBusca
        ? item.aluno.toLowerCase().includes(this.termoBusca.toLowerCase()) ||
          item.matricula.includes(this.termoBusca)
        : true;

      const atendeTurma = this.filtroTurma
        ? item.turma.toLowerCase() === this.filtroTurma.toLowerCase()
        : true;

      return atendeBusca && atendeTurma;
    });
  }
}