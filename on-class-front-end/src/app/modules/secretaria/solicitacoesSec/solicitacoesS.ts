import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface SolicitacaoItem {
  id: string;
  matricula: string;
  dataHora: string;
  aluno: string;
  tipo: string;
  status: 'Pendente' | 'Em Análise' | 'Aprovada' | 'Rejeitada';
  categoria: 'recentes' | 'manuais';
}

@Component({
  selector: 'app-solicitacoes-sec',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitacoesS.html',
  styleUrl: './solicitacoesS.css',
  encapsulation: ViewEncapsulation.None
})
export class SolicitacoesSec implements OnInit {
  abaAtiva: 'recentes' | 'manuais' = 'recentes';

  // Filtros selecionados
  filtroTurno: string = '';
  filtroOrdem: string = 'recente';
  filtroTurma: string = '';
  termoBuscaMatricula: string = '';

  // Lista mock de solicitações
  solicitacoes: SolicitacaoItem[] = [
    {
      id: '1',
      matricula: 'Nº 2024001234',
      dataHora: 'Hoje, 14:32',
      aluno: 'Mariana Souza Santos',
      tipo: 'Solicitação de Abono: Atestado de Casamento',
      status: 'Pendente',
      categoria: 'recentes'
    },
    {
      id: '2',
      matricula: 'Nº 2024001990',
      dataHora: 'Ontem, 09:15',
      aluno: 'Pedro Henrique Alencar',
      tipo: 'Segunda Chamada: Exame Final Física',
      status: 'Em Análise',
      categoria: 'recentes'
    },
    {
      id: '3',
      matricula: 'Nº 2024001002',
      dataHora: '08 Nov 2026',
      aluno: 'Clara Regina Mota',
      tipo: 'Ajuste de Matrícula: Tópicos Especiais',
      status: 'Rejeitada',
      categoria: 'recentes'
    },
    {
      id: '4',
      matricula: 'Nº 2024001552',
      dataHora: '07 Nov 2026',
      aluno: 'Lucas Bezerra da Silva',
      tipo: 'Solicitação de Abono: Atestado Médico',
      status: 'Aprovada',
      categoria: 'recentes'
    },
    {
      id: '5',
      matricula: 'Nº 2024003310',
      dataHora: '06 Nov 2026',
      aluno: 'Gabriela Vasconcelos',
      tipo: 'Validação Manual de Horas Complementares',
      status: 'Em Análise',
      categoria: 'manuais'
    },
    {
      id: '6',
      matricula: 'Nº 2024004412',
      dataHora: '05 Nov 2026',
      aluno: 'Rodrigo Alves Mendes',
      tipo: 'Revisão Manual de Histórico Escolar',
      status: 'Pendente',
      categoria: 'manuais'
    }
  ];

  ngOnInit(): void {}

  mudarAba(aba: 'recentes' | 'manuais'): void {
    this.abaAtiva = aba;
  }

  get solicitacoesFiltradas(): SolicitacaoItem[] {
    return this.solicitacoes.filter(item => {
      const pertenceAba = item.categoria === this.abaAtiva;
      const atendeMatricula = this.termoBuscaMatricula 
        ? item.matricula.toLowerCase().includes(this.termoBuscaMatricula.toLowerCase()) || 
          item.aluno.toLowerCase().includes(this.termoBuscaMatricula.toLowerCase())
        : true;

      return pertenceAba && atendeMatricula;
    });
  }

  voltarDash(): void {
    history.back();
  }
}