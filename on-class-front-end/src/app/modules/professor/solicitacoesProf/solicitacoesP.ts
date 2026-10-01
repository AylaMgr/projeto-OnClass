import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-solicitacoes-p',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './solicitacoesP.html',
  styleUrl: './solicitacoesP.css'
})
export class SolicitacoesP {
  // Lógica de confirmação/recusa do professor
}