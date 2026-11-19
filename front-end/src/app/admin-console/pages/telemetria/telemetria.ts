import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminApiService } from '../../../core/services/admin-api.service';

@Component({
  selector: 'app-telemetria',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './telemetria.html',
  styleUrls: ['./telemetria.css']
})
export class TelemetriaComponent implements OnInit {
  carregando = true;
  periodoSelecionado: 'HOJE' | '7D' | '30D' | '90D' = '30D';
  filtroEventos: 'TODOS' | 'Sucesso' | 'Erro' = 'TODOS';

  nomeInstituicao = 'Colégio Santo Américo';
  ambienteSelecionado = 'Santo Américo';

  metricas: any = {
    usuariosAtivos: 0,
    sessoesIniciadas: 0,
    tempoMedioSessao: '4m 32s',
    taxaErros: '0,18%',
    perfis: {
      alunos: 0,
      professores: 0,
      secretaria: 0
    },
    engajamento: {
      totalNotificacoes: 0,
      totalAtestados: 0,
      totalContatosSuporte: 0
    },
    eventosRecentes: []
  };

  constructor(
    private adminApi: AdminApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarTelemetria();
  }

  carregarTelemetria(): void {
    this.carregando = true;

    this.adminApi.obterTema().subscribe({
      next: (tema: any) => {
        if (tema?.nomeInstituicao || tema?.nomeExibido) {
          this.nomeInstituicao = tema.nomeInstituicao || tema.nomeExibido;
          this.ambienteSelecionado = this.nomeInstituicao.replace(/^Colégio\s+/i, '');
        }
      },
      error: () => {}
    });

    this.adminApi.obterTelemetria().subscribe({
      next: (res) => {
        if (res) {
          this.metricas = {
            ...this.metricas,
            ...res,
            perfis: {
              alunos: res.perfis?.alunos ?? res.engajamento?.alunosAtivos ?? 0,
              professores: res.perfis?.professores ?? res.engajamento?.professoresAtivos ?? 0,
              secretaria: res.perfis?.secretaria ?? res.engajamento?.secretariosAtivos ?? 0
            }
          };
        }
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar telemetria:', err);
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  selecionarPeriodo(p: 'HOJE' | '7D' | '30D' | '90D'): void {
    this.periodoSelecionado = p;
    this.carregarTelemetria();
  }

  get intervaloDatasLabel(): string {
    switch (this.periodoSelecionado) {
      case 'HOJE':
        return 'Hoje • Tempo real';
      case '7D':
        return 'Últimos 7 dias';
      case '90D':
        return 'Últimos 90 dias';
      default:
        return '01 nov – 30 nov, 2026';
    }
  }

  get totalSessoesPerfis(): number {
    const p = this.metricas.perfis || { alunos: 0, professores: 0, secretaria: 0 };
    return Math.max(1, (p.alunos || 0) + (p.professores || 0) + (p.secretaria || 0));
  }

  get percAlunos(): number {
    return Math.round(((this.metricas.perfis?.alunos || 0) / this.totalSessoesPerfis) * 100);
  }

  get percProfessores(): number {
    return Math.round(((this.metricas.perfis?.professores || 0) / this.totalSessoesPerfis) * 100);
  }

  get percSecretaria(): number {
    return Math.max(1, 100 - this.percAlunos - this.percProfessores);
  }

  get eventosFiltrados(): any[] {
    const lista = Array.isArray(this.metricas.eventosRecentes)
      ? this.metricas.eventosRecentes
      : [];
    if (this.filtroEventos === 'TODOS') return lista;
    return lista.filter((e: any) => e.status === this.filtroEventos);
  }

  exportarRelatorioCSV(): void {
    const linhas = [
      ['Metrica', 'Valor'].join(';'),
      ['Usuarios Ativos', this.metricas.usuariosAtivos].join(';'),
      ['Sessoes Iniciadas', this.metricas.sessoesIniciadas].join(';'),
      ['Tempo Medio de Sessao', this.metricas.tempoMedioSessao].join(';'),
      ['Taxa de Erros', this.metricas.taxaErros].join(';'),
      ['Alunos Ativos', this.metricas.perfis?.alunos || 0].join(';'),
      ['Professores Ativos', this.metricas.perfis?.professores || 0].join(';'),
      ['Secretaria Ativa', this.metricas.perfis?.secretaria || 0].join(';'),
      ['Total Notificacoes', this.metricas.engajamento?.totalNotificacoes || 0].join(';')
    ];
    const blob = new Blob([linhas.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `telemetria_onclass_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}