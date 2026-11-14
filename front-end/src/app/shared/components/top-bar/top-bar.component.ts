import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="wl-top-bar">
      <!-- Lado Esquerdo: Voltar + Identificação -->
      <div class="wl-header-left">
        @if (mostrarVoltar) {
          <button type="button" class="wl-icon-btn" (click)="voltarClick.emit()" [title]="backTitle">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
        }

        @if (logoUrl) {
          <img [src]="logoUrl" alt="Logo" class="wl-logo" />
        }

        <div class="wl-header-info">
          <h1>{{ titulo }}</h1>
          <small>{{ subtitulo }}</small>
        </div>
      </div>

      <!-- Centro: Campo de Pesquisa -->
      @if (mostrarPesquisa) {
        <div class="wl-search-wrapper">
          <input
            type="text"
            [ngModel]="termoPesquisa"
            (ngModelChange)="termoPesquisaChange.emit($event)"
            [placeholder]="placeholder" />
        </div>
      }

      <!-- Lado Direito: Notificações + Ações Customizadas -->
      <div class="wl-header-right">
        <button type="button" class="wl-icon-btn" (click)="notificacoesClick.emit()" title="Notificações">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        </button>

        <ng-content></ng-content>
      </div>
    </header>
  `,
  styles: [`
    .wl-top-bar {
      background-color: var(--navbar-bg, #001F54) !important;
      color: #ffffff;
      height: 64px;
      padding: 0 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
      transition: background-color 0.3s ease;
    }

    .wl-header-left,
    .wl-header-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .wl-logo {
      height: 32px;
      width: auto;
      object-fit: contain;
      border-radius: 4px;
    }

    .wl-icon-btn {
      background: transparent;
      border: none;
      color: #ffffff;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 6px;
      border-radius: 8px;
      transition: background-color 0.2s ease;
    }

    .wl-icon-btn:hover {
      background-color: rgba(255, 255, 255, 0.14);
    }

    .wl-header-info {
      display: flex;
      flex-direction: column;
      line-height: 1.25;
    }

    .wl-header-info h1 {
      margin: 0;
      font-size: 15px;
      font-weight: 700;
      color: #ffffff;
    }

    .wl-header-info small {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.82);
    }

    .wl-search-wrapper {
      flex: 1;
      max-width: 460px;
      margin: 0 20px;
    }

    .wl-search-wrapper input {
      width: 100%;
      height: 36px;
      border-radius: 999px;
      border: none;
      background-color: #ffffff;
      padding: 0 18px;
      font-size: 13px;
      color: #1e293b;
      text-align: center;
      outline: none;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }

    .wl-search-wrapper input::placeholder {
      color: #64748b;
    }
  `]
})
export class TopBarComponent {
  @Input() titulo = '';
  @Input() subtitulo = '';
  @Input() logoUrl?: string;
  @Input() placeholder = 'Pesquisar...';
  @Input() backTitle = 'Voltar';
  @Input() mostrarVoltar = true;
  @Input() mostrarPesquisa = true;
  @Input() termoPesquisa = '';

  @Output() termoPesquisaChange = new EventEmitter<string>();
  @Output() voltarClick = new EventEmitter<void>();
  @Output() notificacoesClick = new EventEmitter<void>();
}