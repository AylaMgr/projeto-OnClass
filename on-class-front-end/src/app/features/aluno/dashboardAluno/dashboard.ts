import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CriarNotificacao } from '../../criar-notificacao/criar-notificacao';
import { NotificacoesService, Notificacao } from '../../notificacoes/services/notificacoes.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, CriarNotificacao],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  mostrarFormulario: boolean = false;
  notificacoes: Notificacao[] = [];
  arquivoAtestado: File | null = null;

  // Estado para controlar o modal de detalhes
  notificacaoSelecionada: Notificacao | null = null;

  filtroStatus: string = 'TODOS';
  paginaAtual: number = 1;
  itensPorPagina: number = 5;

  constructor(private readonly notificacoesService: NotificacoesService) {}

  ngOnInit(): void {
    this.carregarNotificacoes();
    this.notificacoesService.notificacaoCriada$.subscribe(() => this.carregarNotificacoes());
  }

  // Normaliza o texto de status evitando falhas de comparação
  private normalizarStatus(statusRaw: any): string {
    if (!statusRaw) return '';
    return String(statusRaw).toUpperCase().trim();
  }

  getStatusClass(statusRaw: string): string {
    const status = this.normalizarStatus(statusRaw);

    if (status.includes('ENCAMINHADO') || status.includes('SECRETARIA') || status === 'APROVADO_SECRETARIA') {
      return 'status-encaminhado';
    }

    if (status.includes('REJEIT') || status.includes('RECUS')) {
      return 'status-rejeitado';
    }

    if (status.includes('APROV') || status === 'CONCLUIDO') {
      return 'status-aprovado';
    }

    return 'status-pendente';
  }

  // Mapeia todas as opções possíveis para exibição amigável ao aluno
  obterTextoStatus(statusRaw: string): string {
    const status = this.normalizarStatus(statusRaw);

    if (status.includes('ENCAMINHADO') || status.includes('SECRETARIA') || status === 'APROVADO_SECRETARIA') {
      return 'Aceito pela Secretaria - Encaminhado para o Professor (Aguardando resultado final)';
    }

    if (status.includes('REJEIT') || status.includes('RECUS')) {
      return 'Recusado pela Secretaria';
    }

    if (status.includes('APROV') || status === 'CONCLUIDO') {
      return 'Solicitação Aprovada Definitivamente';
    }

    return 'Em Análise pela Secretaria';
  }

  carregarNotificacoes(): void {
    this.notificacoesService.listarTodas().subscribe({
      next: (dados) => {
        this.notificacoes = dados || [];
      },
      error: (err) => console.error('Erro ao carregar notificações:', err)
    });
  }

  obterAnalista(item: any): string {
    if (item.administrador) {
      return item.administrador;
    }
    return (item.tipo === 'ATESTADO' || item.temUpload || item.arquivoUrl) ? 'IA' : 'Secretaria';
  }

  abrirDetalhes(item: Notificacao): void {
    this.notificacaoSelecionada = item;
  }

  fecharDetalhes(): void {
    this.notificacaoSelecionada = null;
  }

  filtrarPorStatus(status: string): void {
    this.filtroStatus = status;
    this.paginaAtual = 1;
  }

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.arquivoAtestado = input.files[0];
    }
  }

  get notificacoesFiltradas(): Notificacao[] {
    return this.notificacoes
      .map(item => {
        const ehAtestadoComUpload = (item.tipo === 'ATESTADO' || (item as any).temUpload || (item as any).arquivoUrl);
        const analista = ehAtestadoComUpload
          ? 'IA'
          : (item.administrador && item.administrador !== 'IA' ? item.administrador : 'Secretaria');

        return {
          ...item,
          administrador: analista
        };
      })
      .filter(item => {
        if (this.filtroStatus === 'TODOS') return true;

        const itemStatus = this.normalizarStatus(item.status);
        const filtro = this.normalizarStatus(this.filtroStatus);

        if (filtro === 'APROVADO') {
          return itemStatus.includes('APROV') || itemStatus.includes('ENCAMINHADO') || itemStatus.includes('SECRETARIA');
        }

        if (filtro === 'REJEITADO') {
          return itemStatus.includes('REJEIT') || itemStatus.includes('RECUS');
        }

        if (filtro === 'PENDENTE') {
          return itemStatus === 'PENDENTE' || itemStatus === '';
        }

        return itemStatus === filtro;
      });
  }

  get notificacoesPaginadas(): Notificacao[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return this.notificacoesFiltradas.slice(inicio, inicio + this.itensPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.notificacoesFiltradas.length / this.itensPorPagina) || 1;
  }

  mudarPagina(novaPagina: number): void {
    if (novaPagina >= 1 && novaPagina <= this.totalPaginas) {
      this.paginaAtual = novaPagina;
    }
  }
}