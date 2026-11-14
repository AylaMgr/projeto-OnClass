import { Component, Input, Output, EventEmitter, HostListener, ElementRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface FiltroOpcao {
  label: string;
  valor: string;
}

export interface FiltroDropdown {
  chave: string;
  label: string;          // Texto exibido quando nada está selecionado (ex: "TURNO", "ORDEM", "TURMA")
  opcoes: FiltroOpcao[];
  valorSelecionado: string;
}

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="wl-filter-container">
      @if (rotulo) {
        <span class="wl-filter-label">{{ rotulo }}</span>
      }

      @for (filtro of dropdowns; track filtro.chave) {
        <div class="wl-dropdown">
          <!-- Botão estilo "Últimos 7 dias v" -->
          <button
            type="button"
            class="wl-dropdown-trigger"
            [class.is-open]="dropdownAberto() === filtro.chave"
            [class.has-value]="!!filtro.valorSelecionado"
            (click)="toggleDropdown(filtro.chave, $event)">
            <span>{{ getLabelAtual(filtro) }}</span>
            <svg class="wl-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>

          <!-- Menu Suspenso Flutuante -->
          @if (dropdownAberto() === filtro.chave) {
            <div class="wl-dropdown-menu">
              @for (op of filtro.opcoes; track op.valor) {
                <button
                  type="button"
                  class="wl-dropdown-item"
                  [class.selected]="filtro.valorSelecionado === op.valor"
                  (click)="selecionarOpcao(filtro, op.valor)">
                  {{ op.label }}
                </button>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .wl-filter-container {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .wl-filter-label {
      font-size: 12px;
      font-weight: 600;
      color: #475569;
    }

    .wl-dropdown {
      position: relative;
      display: inline-block;
    }

    /* Botão Trigger idêntico ao "Últimos 7 dias v" */
    .wl-dropdown-trigger {
      display: inline-flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      height: 30px;
      padding: 0 12px;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 11.5px;
      font-weight: 500;
      color: #334155;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .wl-dropdown-trigger:hover,
    .wl-dropdown-trigger.is-open {
      background-color: #ffffff;
      border-color: #cbd5e1;
      box-shadow: 0 2px 5px rgba(15, 23, 42, 0.05);
    }

    .wl-dropdown-trigger.has-value {
      color: var(--primary-color, #0066FF);
      border-color: color-mix(in srgb, var(--primary-color, #0066FF) 35%, #e2e8f0);
      background-color: #ffffff;
      font-weight: 600;
    }

    .wl-chevron {
      color: #64748b;
      transition: transform 0.2s ease;
    }

    .wl-dropdown-trigger.is-open .wl-chevron {
      transform: rotate(180deg);
    }

    /* Menu Flutuante Arredondado */
    .wl-dropdown-menu {
      position: absolute;
      top: calc(100% + 6px);
      left: 0;
      min-width: 145px;
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 4px;
      box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.12), 0 4px 10px -2px rgba(15, 23, 42, 0.05);
      z-index: 999;
      display: flex;
      flex-direction: column;
      gap: 2px;
      animation: fadeInMenu 0.15s ease-out;
    }

    @keyframes fadeInMenu {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Itens do Menu */
    .wl-dropdown-item {
      width: 100%;
      text-align: left;
      padding: 7px 12px;
      border: none;
      background: transparent;
      border-radius: 6px;
      font-size: 11.5px;
      font-weight: 500;
      color: #334155;
      cursor: pointer;
      transition: background-color 0.15s ease, color 0.15s ease;
      white-space: nowrap;
    }

    .wl-dropdown-item:hover {
      background-color: #f1f5f9;
    }

    /* Item Ativo/Selecionado (Azul destacado igual à referência) */
    .wl-dropdown-item.selected {
      background-color: color-mix(in srgb, var(--primary-color, #0066FF) 10%, #ffffff);
      color: var(--primary-color, #0066FF) !important;
      font-weight: 700;
    }
  `]
})
export class FilterBarComponent {
  private elementRef = inject(ElementRef);

  @Input() rotulo = '';
  @Input() dropdowns: FiltroDropdown[] = [];
  @Output() filtroChange = new EventEmitter<{ chave: string; valor: string }>();

  dropdownAberto = signal<string | null>(null);

  toggleDropdown(chave: string, event: Event): void {
    event.stopPropagation();
    this.dropdownAberto.update(atual => (atual === chave ? null : chave));
  }

  selecionarOpcao(filtro: FiltroDropdown, valor: string): void {
    filtro.valorSelecionado = valor;
    this.dropdownAberto.set(null);
    this.filtroChange.emit({ chave: filtro.chave, valor });
  }

  getLabelAtual(filtro: FiltroDropdown): string {
    if (!filtro.valorSelecionado) {
      return filtro.label;
    }
    const encontrada = filtro.opcoes.find(op => op.valor === filtro.valorSelecionado);
    return encontrada ? encontrada.label : filtro.label;
  }

  @HostListener('document:click', ['$event'])
  onClickFora(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.dropdownAberto.set(null);
    }
  }
}