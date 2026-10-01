import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-analises-manuais',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './analisesManuais.html',
  styleUrl: './analisesManuais.css'
})
export class AnalisesManuais {
  // Lógica para listar análises manuais da secretaria
}