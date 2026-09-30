import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

export interface ItemTabelaResumo {
  alunoNome: string;
  turma: string;
  motivo: string;
  dataEnvio: string;
  status: 'Pendente' | 'Aprovada' | 'Rejeitada';
}

@Component({
  selector: 'app-dashboard-sec',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboardS.html',
  styleUrl: './dashboardS.css'
})
export class DashboardS {
  termoMatricula: string = '';

  recebidosRecentemente: ItemTabelaResumo[] = [
    {
      alunoNome: 'Guilherme Sant...',
      turma: '8º Ano A - Matutino',
      motivo: 'Consulta Pediátrica',
      dataEnvio: 'Hoje, 09h41',
      status: 'Pendente'
    },
    {
      alunoNome: 'Mariana Souza',
      turma: '3º Ano B - Vesperti...',
      motivo: 'Sintomas Gripais',
      dataEnvio: 'Ontem, 16h20',
      status: 'Aprovada'
    }
  ];

  analisesManuais: ItemTabelaResumo[] = [
    {
      alunoNome: 'Guilherme Sant...',
      turma: '8º Ano A - Matutino',
      motivo: 'Consulta Pediátrica',
      dataEnvio: 'Hoje, 09h41',
      status: 'Rejeitada'
    },
    {
      alunoNome: 'Mariana Souza',
      turma: '3º Ano B - Vesperti...',
      motivo: 'Sintomas Gripais',
      dataEnvio: 'Ontem, 16h20',
      status: 'Rejeitada'
    }
  ];

  constructor(private router: Router) {}

  voltar(): void {
    this.router.navigate(['/login']);
  }
}