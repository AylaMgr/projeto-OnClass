import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CriarNotificacao } from '../../notificacoes/components/criar-notificacao/criar-notificacao';
import { NotificacoesService, Notificacao } from '../../notificacoes/services/notificacoes';

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

  filtroStatus: string = 'TODOS';
  paginaAtual: number = 1;
  itensPorPagina: number = 5;

  constructor(private readonly notificacoesService: NotificacoesService) {}

  ngOnInit(): void {
    this.carregarNotificacoes();
  }

  carregarNotificacoes(): void {
    this.notificacoesService.listarRecentes?.().subscribe({
      next: (dados: Notificacao[]) => (this.notificacoes = dados),
      error: (err: unknown) => console.error(err)
    });
  }

  filtrarPorStatus(status: string): void {
    this.filtroStatus = status;
    this.paginaAtual = 1;
  }

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
  }

  // Método que trata a seleção de ficheiros no input da linha 64
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.arquivoAtestado = input.files[0];
    }
  }

  // Lista apenas filtrada por status (sem corte de página)
  get notificacoesFiltradas(): Notificacao[] {
    return this.notificacoes.filter(item => {
      if (this.filtroStatus === 'TODOS') return true;
      return item.status?.toUpperCase() === this.filtroStatus.toUpperCase();
    });
  }

  // Lista cortada para exibição da página atual
  get notificacoesPaginadas(): Notificacao[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return this.notificacoesFiltradas.slice(inicio, inicio + this.itensPorPagina);
  }

  // Cálculo total de páginas para a paginação
  get totalPaginas(): number {
    return Math.ceil(this.notificacoesFiltradas.length / this.itensPorPagina) || 1;
  }

  // Método para avançar ou recuar páginas
  mudarPagina(novaPagina: number): void {
    if (novaPagina >= 1 && novaPagina <= this.totalPaginas) {
      this.paginaAtual = novaPagina;
    }
  }

  // Estilação dos badges de status
  getStatusClass(status: string): string {
    if (!status) return 'status-padrao';

    switch (status.toLowerCase()) {
      case 'aprovado':
      case 'deferido':
        return 'status-aprovado';
      case 'pendente':
      case 'em análise':
        return 'status-pendente';
      case 'recusado':
      case 'indeferido':
        return 'status-recusado';
      default:
        return 'status-padrao';
    }
  }
}