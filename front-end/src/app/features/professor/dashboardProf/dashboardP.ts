import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificacoesService } from '../../notificacoes/services/notificacoes.service';
import { TopBarComponent } from '../../../shared/components/top-bar/top-bar.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { FilterBarComponent, FiltroDropdown } from '../../../shared/components/filter-bar/filter-bar.component';

export interface SolicitacaoAluno {
  id: string;
  matricula: string;
  aluno: string;
  motivo: string;
  dataEnvio: string;
  dataTimestamp: number;
  status: string;
  turno: string;
  turma: string;
}

@Component({
  selector: 'app-dashboard-prof',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TopBarComponent,
    StatusBadgeComponent,
    FilterBarComponent
  ],
  templateUrl: './dashboardP.html',
  styleUrls: ['./dashboardP.css']
})
export class DashboardP implements OnInit {
  termoMatricula: string = '';
  turnoSelecionado: string = '';
  ordemSelecionada: string = '';
  turmaSelecionada: string = '';
  carregando: boolean = false;

  solicitacoes: SolicitacaoAluno[] = [];

  filtrosProfessor: FiltroDropdown[] = [
    {
      chave: 'turno',
      label: 'Turno',
      valorSelecionado: '',
      opcoes: [
        { label: 'Todos os Turnos', valor: '' },
        { label: 'Matutino', valor: 'Matutino' },
        { label: 'Vespertino', valor: 'Vespertino' },
        { label: 'Noturno', valor: 'Noturno' }
      ]
    },
    {
      chave: 'ordem',
      label: 'Ordem',
      valorSelecionado: '',
      opcoes: [
        { label: 'Mais Recentes', valor: 'recentes' },
        { label: 'Mais Antigos', valor: 'antigos' }
      ]
    },
    {
      chave: 'turma',
      label: 'Turma',
      valorSelecionado: '',
      opcoes: [
        { label: 'Todas as Turmas', valor: '' }
      ]
    }
  ];

  constructor(
    private readonly router: Router,
    private readonly notificacoesService: NotificacoesService
  ) {}

  ngOnInit(): void {
    this.carregarSolicitacoes();
  }

  carregarSolicitacoes(): void {
    this.carregando = true;

    this.notificacoesService.listarTodas().subscribe({
      next: (dados: any[]) => {
        if (dados && Array.isArray(dados)) {
          const aprovadasOuEncaminhadas = dados.filter((item) => {
            const statusUpper = String(item.status || '').toUpperCase().trim();
            const ehAprovadaOuEncaminhada =
              statusUpper === 'ENCAMINHADO_PROFESSOR' ||
              statusUpper === 'APROVADO_SECRETARIA' ||
              statusUpper === 'APROVADA' ||
              statusUpper === 'APROVADO' ||
              statusUpper === 'ACEITO' ||
              statusUpper.includes('ENCAMINHADO') ||
              statusUpper.includes('APROVAD');

            // Ignora registos antigos de teste sem aluno válido no MongoDB
            const nomeReal = item.alunoNome || item.aluno?.nome || '';
            const temAlunoValido =
              Boolean(nomeReal) && nomeReal !== 'Aluno não identificado';

            return ehAprovadaOuEncaminhada && temAlunoValido;
          });

          this.solicitacoes = aprovadasOuEncaminhadas.map((item) => {
            const dataBruta = item.dataEnvio || item.createdAt || item.criadoEm;
            const dataObj = dataBruta ? new Date(dataBruta) : null;

            const nomeAlunoString =
              typeof item.aluno === 'string'
                ? item.aluno
                : item.alunoNome ||
                  item.aluno?.nome ||
                  item.nomeAluno ||
                  'Aluno Não Identificado';

            return {
              id: String(item.id || item._id),
              matricula: String(
                item.matricula ||
                  item.alunoMatricula ||
                  item.aluno?.matricula ||
                  'Sem matrícula',
              ),
              aluno: nomeAlunoString,
              motivo: item.motivo || item.titulo || 'Solicitação de Abono',
              dataEnvio:
                dataObj && !isNaN(dataObj.getTime())
                  ? dataObj.toLocaleString('pt-BR', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })
                  : 'Data não informada',
              dataTimestamp:
                dataObj && !isNaN(dataObj.getTime()) ? dataObj.getTime() : 0,
              status: item.status || 'ENCAMINHADO_PROFESSOR',
              turno: item.turno || item.aluno?.turno || 'Matutino',
              turma:
                item.turma ||
                item.alunoTurma ||
                item.aluno?.turmas?.[0] ||
                'Não informada',
            };
          });

          this.atualizarOpcoesTurma();
        } else {
          this.solicitacoes = [];
        }
        this.carregando = false;
      },
      error: (err) => {
        console.error('Erro ao buscar solicitações do banco:', err);
        this.solicitacoes = [];
        this.carregando = false;
      },
    });
  }

  private atualizarOpcoesTurma(): void {
    const turmasUnicas = Array.from(
      new Set(this.solicitacoes.map(s => s.turma).filter(t => t && t !== 'Não informada'))
    ).sort();

    const filtroTurma = this.filtrosProfessor.find(f => f.chave === 'turma');
    if (filtroTurma) {
      filtroTurma.opcoes = [
        { label: 'Todas as Turmas', valor: '' },
        ...turmasUnicas.map(turma => ({ label: turma, valor: turma }))
      ];
    }
  }

  onFiltroProfessorChange(evento: { chave: string; valor: string }): void {
    if (evento.chave === 'turno') this.turnoSelecionado = evento.valor;
    if (evento.chave === 'ordem') this.ordemSelecionada = evento.valor;
    if (evento.chave === 'turma') this.turmaSelecionada = evento.valor;
  }

  resetarFiltrosProfessor(): void {
    this.termoMatricula = '';
    this.turnoSelecionado = '';
    this.ordemSelecionada = '';
    this.turmaSelecionada = '';
    this.filtrosProfessor.forEach(f => (f.valorSelecionado = ''));
  }

  abrirSolicitacao(id: string): void {
    if (id) {
      this.router.navigate(['/professor/solicitacoes', id]);
    }
  }

  get solicitacoesFiltradas(): SolicitacaoAluno[] {
    const termo = this.termoMatricula.toLowerCase().trim();

    let lista = this.solicitacoes.filter(item => {
      const atendeBusca =
        !termo ||
        item.matricula.toLowerCase().includes(termo) ||
        item.aluno.toLowerCase().includes(termo);
      const atendeTurno = !this.turnoSelecionado || item.turno === this.turnoSelecionado;
      const atendeTurma = !this.turmaSelecionada || item.turma === this.turmaSelecionada;

      return atendeBusca && atendeTurno && atendeTurma;
    });

    if (this.ordemSelecionada === 'recentes') {
      lista = [...lista].sort((a, b) => b.dataTimestamp - a.dataTimestamp);
    } else if (this.ordemSelecionada === 'antigos') {
      lista = [...lista].sort((a, b) => a.dataTimestamp - b.dataTimestamp);
    }

    return lista;
  }

  voltarLogin(): void {
    this.router.navigate(['/login']);
  }
}