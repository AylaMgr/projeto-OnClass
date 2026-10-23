import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificacoesService, Notificacao } from '../notificacoes/services/notificacoes.service';

@Component({
  selector: 'app-listar-notificacoes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './listar-notificacoes.html',
  styleUrls: ['./listar-notificacoes.css']
})
export class ListarNotificacoes implements OnInit {
  notificacoes: Notificacao[] = [];
  carregando: boolean = true;
  erro: string = '';

  constructor(private readonly notificacoesService: NotificacoesService) {}

  ngOnInit(): void {
    this.carregarNotificacoes();
  }

  carregarNotificacoes(): void {
    this.carregando = true;
    this.notificacoesService.listarRecentes().subscribe({
      next: (dados) => {
        this.notificacoes = dados;
        this.carregando = false;
      },
      error: (err: unknown) => {
        this.erro = 'Não foi possível carregar as notificações.';
        this.carregando = false;
        console.error(err);
      }
    });
  }

  // Função auxiliar para definir a cor/classe do status
  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'APROVADO':
        return 'status-aprovado';
      case 'REJEITADO':
        return 'status-rejeitado';
      default:
        return 'status-pendente';
    }
  }
}