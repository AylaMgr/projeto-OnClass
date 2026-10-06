import { Component, OnInit, ViewEncapsulation } from '@angular/core';
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

    getStatusClass(status: string): string {
  if (!status) return 'status-pendente';
  
  switch (status.toUpperCase()) {
    case 'APROVADO':
      return 'status-aprovado';
    case 'REJEITADO':
      return 'status-rejeitado';
    case 'PENDENTE':
    default:
      return 'status-pendente';
  }
}
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

  carregarNotificacoes(): void {
    this.notificacoesService.listarTodas().subscribe({
      next: (dados) => this.notificacoes = dados || [],
      error: (err) => console.error('Erro ao carregar notificações:', err)
    });
  }

  obterAnalista(item: any): string {
  if (item.administrador) {
    return item.administrador;
  }
  // Se tiver upload de atestado é IA, caso contrário é Secretaria
  return (item.tipo === 'ATESTADO' || item.temUpload || item.arquivoUrl) ? 'IA' : 'Secretaria';
}

  // Métodos para abrir e fechar o modal de detalhes
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
      // 1. Identifica se é envio de atestado/upload
      const ehAtestadoComUpload = (item.tipo === 'ATESTADO' || (item as any).temUpload || (item as any).arquivoUrl);

      // 2. Garante o responsável correto (IA se for upload, Secretaria caso contrário)
      const analista = ehAtestadoComUpload 
        ? 'IA' 
        : (item.administrador && item.administrador !== 'IA' ? item.administrador : 'Secretaria');

      return {
        ...item,
        administrador: analista
      };
    })
    .filter(item => {
      // 3. Aplica o filtro de status (Todos, Pendentes, Aprovados, Rejeitados)
      if (this.filtroStatus === 'TODOS') return true;
      return item.status?.toUpperCase() === this.filtroStatus.toUpperCase();
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