import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  title = 'on-class-front-end';

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.themeService.carregarEAplicarTema();
  }
}