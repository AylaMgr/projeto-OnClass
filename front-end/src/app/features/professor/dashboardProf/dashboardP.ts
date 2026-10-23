import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NotificacoesService } from '../../notificacoes/services/notificacoes.service';

export interface SolicitacaoAluno {
  id: string;
  matricula: string;
  aluno: string;
  motivo: string;
  dataEnvio: string;
  status: string;
  turno?: string;
  turma?: string;
}

@Component({
  selector: 'app-dashboard-prof',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dashboardP.html',
  styleUrl: './dashboardP.css'
})
export class DashboardP implements OnInit {

  termoMatricula: string = '';
  turnoSelecionado: string = '';
  ordemSelecionada: string = '';
  turmaSelecionada: string = '';
  dropdownAberto: string | null = null;
  carregando: boolean = false;

  // Começa vazia e será preenchida exclusivamente pelos dados retornados do serviço
  solicitacoes: SolicitacaoAluno[] = [];

  constructor(
    private readonly router: Router,
    private readonly notificacoesService: NotificacoesService
  ) {}

  ngOnInit(): void {
    this.carregarSolicitacoes();
  }

  carregarSolicitacoes(): void {
    this.carregando = true;
    
    // Busca a lista real do serviço NotificacoesService
    this.notificacoesService.listarTodas().subscribe({
      next: (dados: any[]) => {
        if (dados && Array.isArray(dados)) {
          // Filtra estritamente apenas as solicitações com status aceito/encaminhado pela Secretaria
          const aprovadasPelaSecretaria = dados.filter(item => {
            const statusUpper = String(item.status || '').toUpperCase().trim();
            return statusUpper === 'ENCAMINHADO_PROFESSOR' || 
                   statusUpper === 'APROVADO_SECRETARIA' ||
                   statusUpper.includes('ENCAMINHADO');
          });

          // Mapeia os dados reais do backend para a interface utilizada no template do professor
          this.solicitacoes = aprovadasPelaSecretaria.map(item => ({
            id: String(item.id),
            matricula: item.matricula || item.alunoMatricula || 'Sem matrícula',
            aluno: item.aluno || item.alunoNome || 'Aluno Não Identificado',
            motivo: item.motivo || item.titulo || 'Solicitação de Abono',
            dataEnvio: item.dataEnvio 
              ? new Date(item.dataEnvio).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) 
              : 'Data não informada',
            status: item.status || 'ENCAMINHADO_PROFESSOR',
            turno: item.turno || 'Matutino',
            turma: item.turma || '8º Ano A'
          }));
        } else {
          this.solicitacoes = [];
        }
        this.carregando = false;
      },
      error: (err) => {
        console.error('Erro ao buscar solicitações da Secretaria:', err);
        this.solicitacoes = [];
        this.carregando = false;
      }
    });
  }

  // Navega para a tela solicitacoesP passando o ID da solicitação selecionada
  abrirSolicitacao(id: string): void {
    if (id) {
    this.router.navigate(['/professor/solicitacoes', id]);
  }
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

  @HostListener('document:click')
  fecharDropdowns(): void {
    this.dropdownAberto = null;
  }

  get solicitacoesFiltradas(): SolicitacaoAluno[] {
    let lista = this.solicitacoes.filter(item => {
      const atendeMatricula = !this.termoMatricula || item.matricula.includes(this.termoMatricula);
      const atendeTurno = !this.turnoSelecionado || item.turno === this.turnoSelecionado;
      const atendeTurma = !this.turmaSelecionada || item.turma === this.turmaSelecionada;

      return atendeMatricula && atendeTurno && atendeTurma;
    });

    if (this.ordemSelecionada === 'recentes') {
      lista = lista.reverse();
    }

    return lista;
  }

  limparFiltros(): void {
    this.termoMatricula = '';
    this.turnoSelecionado = '';
    this.ordemSelecionada = '';
    this.turmaSelecionada = '';
    this.dropdownAberto = null;
  }

  voltarLogin(): void {
    this.router.navigate(['/login']);
  }
}