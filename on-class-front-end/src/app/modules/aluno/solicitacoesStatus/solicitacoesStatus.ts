import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-solicitacoes-status',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './solicitacoesStatus.html',
  styleUrl: './solicitacoesStatus.css'
})
export class SolicitacoesStatus {
  // Lógica de detalhes e status do aluno
}