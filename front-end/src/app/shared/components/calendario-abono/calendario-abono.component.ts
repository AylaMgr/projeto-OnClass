import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

interface DiaCalendario {
  numero: number | null;
  dataIso: string;
  abonado: boolean;
  inicio: boolean;
  fim: boolean;
}

@Component({
  selector: 'app-calendario-abono',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cal-card">
      <div class="cal-header">
        <div>
          <span class="cal-badge">PERÍODO DE ABONO SOLICITADO</span>
          <h4>{{ tituloMesAno }}</h4>
        </div>
        <div class="cal-nav">
          <button type="button" (click)="mudarMes(-1)" title="Mês anterior">◀</button>
          <button type="button" (click)="mudarMes(1)" title="Próximo mês">▶</button>
        </div>
      </div>

      <div class="cal-resumo">
        <span>Início: <strong>{{ formatarBr(dataInicioNorm) }}</strong></span>
        <span>Término: <strong>{{ formatarBr(dataFimNorm) }}</strong></span>
        <span class="cal-dias-pill">{{ totalDiasAbonados }} {{ totalDiasAbonados === 1 ? 'dia' : 'dias' }}</span>
      </div>

      <div class="cal-weekdays">
        <span>Dom</span><span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span>
      </div>

      <div class="cal-grid">
        <div
          *ngFor="let dia of diasMes"
          class="cal-cell"
          [class.empty]="!dia.numero"
          [class.abonado]="dia.abonado"
          [class.inicio]="dia.inicio"
          [class.fim]="dia.fim"
        >
          {{ dia.numero || '' }}
        </div>
      </div>

      <div class="cal-legenda">
        <span class="dot-abono"></span> Dias com falta abonada / justificada
      </div>
    </div>
  `,
  styles: [`
    .cal-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      margin-top: 16px;
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
    }
    .cal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .cal-badge {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.5px;
      color: var(--primary-color, #1d4ed8);
      text-transform: uppercase;
    }
    .cal-header h4 {
      margin: 2px 0 0;
      font-size: 15px;
      font-weight: 700;
      color: #1e293b;
      text-transform: capitalize;
    }
    .cal-nav {
      display: flex;
      gap: 6px;
    }
    .cal-nav button {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      width: 28px;
      height: 28px;
      cursor: pointer;
      color: #334155;
      font-size: 11px;
    }
    .cal-nav button:hover {
      background: #e2e8f0;
    }
    .cal-resumo {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 12px;
      color: #475569;
      margin-bottom: 12px;
      flex-wrap: wrap;
      gap: 6px;
    }
    .cal-dias-pill {
      background: #dbeafe;
      color: #1e40af;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 11px;
    }
    .cal-weekdays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      text-align: center;
      font-size: 11px;
      font-weight: 700;
      color: #64748b;
      margin-bottom: 6px;
    }
    .cal-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;
    }
    .cal-cell {
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      border-radius: 8px;
      color: #334155;
      background: #f8fafc;
    }
    .cal-cell.empty {
      background: transparent;
    }
    .cal-cell.abonado {
      background: #dbeafe;
      color: #1e3a8a;
      font-weight: 700;
      border: 1px solid #93c5fd;
    }
    .cal-cell.inicio, .cal-cell.fim {
      background: var(--primary-color, #2563eb);
      color: #ffffff;
      border-color: var(--primary-color, #2563eb);
    }
    .cal-legenda {
      margin-top: 10px;
      font-size: 11px;
      color: #64748b;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .dot-abono {
      width: 10px;
      height: 10px;
      border-radius: 3px;
      background: var(--primary-color, #2563eb);
      display: inline-block;
    }
  `]
})
export class CalendarioAbonoComponent implements OnChanges {
  @Input() dataInicio?: string;
  @Input() dataFim?: string;

  anoAtual: number = new Date().getFullYear();
  mesAtual: number = new Date().getMonth(); // 0 a 11
  diasMes: DiaCalendario[] = [];

  dataInicioNorm: string = '';
  dataFimNorm: string = '';

  ngOnChanges(): void {
    this.dataInicioNorm = this.normalizarIso(this.dataInicio);
    this.dataFimNorm = this.normalizarIso(this.dataFim || this.dataInicio);

    if (this.dataInicioNorm) {
      const [ano, mes] = this.dataInicioNorm.split('-').map(Number);
      this.anoAtual = ano;
      this.mesAtual = mes - 1;
    }

    this.gerarGradeMes();
  }

  private normalizarIso(valor?: string): string {
    if (!valor) return '';
    const str = String(valor).trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.split('T')[0];
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
      const [d, m, a] = str.split('/');
      return `${a}-${m}-${d}`;
    }
    return '';
  }

  formatarBr(iso: string): string {
    if (!iso || !iso.includes('-')) return 'Não informada';
    const [a, m, d] = iso.split('-');
    return `${d}/${m}/${a}`;
  }

  get tituloMesAno(): string {
    const dt = new Date(this.anoAtual, this.mesAtual, 1);
    return dt.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }

  get totalDiasAbonados(): number {
    if (!this.dataInicioNorm || !this.dataFimNorm) return 0;
    const ini = new Date(`${this.dataInicioNorm}T12:00:00`).getTime();
    const fim = new Date(`${this.dataFimNorm}T12:00:00`).getTime();
    if (fim < ini) return 1;
    return Math.round((fim - ini) / (1000 * 60 * 60 * 24)) + 1;
  }

  mudarMes(delta: number): void {
    this.mesAtual += delta;
    if (this.mesAtual > 11) {
      this.mesAtual = 0;
      this.anoAtual++;
    } else if (this.mesAtual < 0) {
      this.mesAtual = 11;
      this.anoAtual--;
    }
    this.gerarGradeMes();
  }

  private gerarGradeMes(): void {
    const primeiroDiaSemana = new Date(this.anoAtual, this.mesAtual, 1).getDay();
    const ultimoDiaMes = new Date(this.anoAtual, this.mesAtual + 1, 0).getDate();
    const pad = (n: number) => String(n).padStart(2, '0');

    const grade: DiaCalendario[] = [];

    for (let i = 0; i < primeiroDiaSemana; i++) {
      grade.push({ numero: null, dataIso: '', abonado: false, inicio: false, fim: false });
    }

    for (let dia = 1; dia <= ultimoDiaMes; dia++) {
      const iso = `${this.anoAtual}-${pad(this.mesAtual + 1)}-${pad(dia)}`;
      const abonado = !!(
        this.dataInicioNorm &&
        this.dataFimNorm &&
        iso >= this.dataInicioNorm &&
        iso <= this.dataFimNorm
      );

      grade.push({
        numero: dia,
        dataIso: iso,
        abonado,
        inicio: iso === this.dataInicioNorm,
        fim: iso === this.dataFimNorm
      });
    }

    this.diasMes = grade;
  }
}