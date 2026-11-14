import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type StatusTipo = 'pendente' | 'aprovada' | 'rejeitada';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="wl-status-badge" [ngClass]="'wl-status-' + tipoNormalizado()">
      {{ textoExibido() }}
    </span>
  `,
  styles: [`
    .wl-status-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 5px 16px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.2px;
      white-space: nowrap;
      transition: background-color 0.3s ease, color 0.3s ease;
    }

    .wl-status-pendente {
      background-color: color-mix(in srgb, var(--card-pendente-bg, #F59E0B) 16%, #ffffff) !important;
      color: color-mix(in srgb, var(--card-pendente-bg, #F59E0B) 85%, #000000) !important;
    }

    .wl-status-aprovada {
      background-color: color-mix(in srgb, var(--card-aprovado-bg, #10B981) 16%, #ffffff) !important;
      color: color-mix(in srgb, var(--card-aprovado-bg, #10B981) 85%, #000000) !important;
    }

    .wl-status-rejeitada {
      background-color: color-mix(in srgb, var(--card-recusado-bg, #EF4444) 15%, #ffffff) !important;
      color: color-mix(in srgb, var(--card-recusado-bg, #EF4444) 90%, #000000) !important;
    }
  `]
})
export class StatusBadgeComponent {
  private _status = signal<string>('');
  private _labelCustomizado = signal<string | undefined>(undefined);

  @Input({ required: true }) set status(val: string) {
    this._status.set(val || '');
  }

  /** Opcional: se quiser exibir texto customizado mantendo a cor padronizada */
  @Input() set label(val: string | undefined) {
    this._labelCustomizado.set(val);
  }

  tipoNormalizado = computed<StatusTipo>(() => {
    const s = this._status().toLowerCase().trim();
    if (s.includes('aprov') || s.includes('conclu') || s.includes('deferid')) {
      return 'aprovada';
    }
    if (s.includes('rejeit') || s.includes('recus') || s.includes('indeferid')) {
      return 'rejeitada';
    }
    return 'pendente';
  });

  textoExibido = computed(() => {
    if (this._labelCustomizado()) {
      return this._labelCustomizado()!;
    }
    const mapa: Record<StatusTipo, string> = {
      pendente: 'Pendente',
      aprovada: 'Aprovada',
      rejeitada: 'Rejeitada'
    };
    return mapa[this.tipoNormalizado()];
  });
}