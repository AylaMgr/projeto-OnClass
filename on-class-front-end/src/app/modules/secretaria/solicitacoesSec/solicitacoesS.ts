import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Interface com TODOS os campos suportados (incluindo matricula, alunoNome e motivo)
export interface Solicitacao {
  id: string;
  numMatricula?: string;
  matricula?: string;
  dataHora?: string;
  aluno?: string;
  alunoNome?: string;
  tipo?: string;
  motivo?: string;
  turno?: string;
  turma?: string;
  status: string;
}

@Component({
  selector: 'app-solicitacoes-sec',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitacoesS.html',
  styleUrl: './solicitacoesS.css'
})
export class SolicitacoesSec implements OnInit {
  termoPesquisa: string = '';
  filtroTurno: string = '';
  filtroOrdem: string = 'recentes';
  filtroTurma: string = '';

  // Método para resetar todos os filtros e a barra de pesquisa
  limparFiltros(): void {
    this.termoPesquisa = '';
    this.filtroTurno = '';
    this.filtroOrdem = 'recentes';
    this.filtroTurma = '';
    this.aplicarFiltros();
  }

  // Lista mock mapeada com ambos os nomes de campos para evitar erros no HTML
  todasSolicitacoes: Solicitacao[] = [
    {
      id: '1',
      numMatricula: '2024001234',
      matricula: '2024001234',
      dataHora: '14b, 11:22',
      aluno: 'Mariana Souza Santos',
      alunoNome: 'Mariana Souza Santos',
      tipo: 'Solicitação de Abono: Atestado de Comparecimento',
      motivo: 'Solicitação de Abono: Atestado de Comparecimento',
      turno: 'Manhã',
      turma: 'INFO1',
      status: 'Sujeito'
    },
    {
      id: '2',
      numMatricula: '2024001990',
      matricula: '2024001990',
      dataHora: 'Ontem, 08:15',
      aluno: 'Pedro Henrique Alencar',
      alunoNome: 'Pedro Henrique Alencar',
      tipo: 'Segunda Chamada: Exame Final Física',
      motivo: 'Segunda Chamada: Exame Final Física',
      turno: 'Tarde',
      turma: 'ADM2',
      status: 'Sujeito'
    },
    {
      id: '3',
      numMatricula: '2024001552',
      matricula: '2024001552',
      dataHora: '07 Nov, 20:01',
      aluno: 'Clara Regina Mota',
      alunoNome: 'Clara Regina Mota',
      tipo: 'Ajuste de Matrícula: Tópicos Especiais',
      motivo: 'Ajuste de Matrícula: Tópicos Especiais',
      turno: 'Noite',
      turma: 'INFO2',
      status: 'Sujeito'
    }
  ];

  solicitacoesFiltradas: Solicitacao[] = [];

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    this.aplicarFiltros();
  }

  voltarDash(): void {
    this.router.navigate(['/secretaria/dashboard']);
  }

  getStatusClass(status: string): string {
    if (!status) return '';
    const st = status.toLowerCase();
    if (st.includes('aguardando') || st.includes('sujeito')) return 'aguardando';
    if (st.includes('aprovado') || st.includes('deferido')) return 'aprovado';
    if (st.includes('recusado') || st.includes('indeferido')) return 'recusado';
    return st;
  }

  aplicarFiltros(): void {
    let resultado = [...this.todasSolicitacoes];

    if (this.termoPesquisa.trim() !== '') {
      const termo = this.termoPesquisa.toLowerCase();
      resultado = resultado.filter(s =>
        (s.aluno && s.aluno.toLowerCase().includes(termo)) ||
        (s.alunoNome && s.alunoNome.toLowerCase().includes(termo)) ||
        (s.matricula && s.matricula.toLowerCase().includes(termo)) ||
        (s.numMatricula && s.numMatricula.toLowerCase().includes(termo))
      );
    }

    if (this.filtroTurno) {
      resultado = resultado.filter(s => s.turno === this.filtroTurno);
    }

    if (this.filtroTurma) {
      resultado = resultado.filter(s => s.turma === this.filtroTurma);
    }

    this.solicitacoesFiltradas = resultado;
  }
}