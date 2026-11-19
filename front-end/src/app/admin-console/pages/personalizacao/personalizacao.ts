import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ThemeService, TemaConfig } from '../../../core/services/theme.service';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { PreviewDeviceComponent } from '../../preview-device/preview-device';

@Component({
  selector: 'app-personalizacao',
  standalone: true,
  imports: [CommonModule, FormsModule, PreviewDeviceComponent, RouterModule],
  templateUrl: './personalizacao.html',
  styleUrls: ['./personalizacao.css']
})
export class PersonalizacaoComponent implements OnInit {
  @ViewChild(PreviewDeviceComponent) previewDevice!: PreviewDeviceComponent;

  salvando = false;

  config = {
    nomeExibido: 'Colégio Santo Américo',
    dominio: 'app.santoamerico.edu.br',
    telaSelecionada: 'dashboard_aluno'
  };

  modoEdicao: 'global' | 'tela' = 'global';

  coresAtivas: TemaConfig = {
    corPrimaria: '#0066FF',
    corNavbar: '#001F54',
    corCardsPend: '#F59E0B',
    corCardsAprov: '#10B981',
    corCardsRecus: '#EF4444'
  };

  telasDisponiveis = [
    { id: 'login', name: 'Login' },
    { id: 'dashboard_aluno', name: 'Home do aluno / responsável' },
    { id: 'dashboard_sec', name: 'Dashboard Secretaria' },
    { id: 'analises_manuais', name: 'Análises Manuais' },
    { id: 'solicitacoes_sec', name: 'Revisão da Secretaria' },
    { id: 'dashboard_prof', name: 'Dashboard do Professor' },
    { id: 'solicitacoes_prof', name: 'Solicitações Professor' }
  ];

  constructor(
    private themeService: ThemeService,
    private adminApi: AdminApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.themeService.carregarEAplicarTema();
    this.adminApi.obterTema().subscribe({
      next: (tema: any) => {
        if (tema) {
          if (tema.nomeInstituicao || tema.nomeExibido) {
            this.config.nomeExibido = tema.nomeInstituicao || tema.nomeExibido;
          }
          if (tema.dominio) this.config.dominio = tema.dominio;
          this.coresAtivas = {
            corPrimaria: tema.corPrimaria || this.coresAtivas.corPrimaria,
            corNavbar: tema.corNavbar || this.coresAtivas.corNavbar,
            corCardsPend: tema.corCardsPend || this.coresAtivas.corCardsPend,
            corCardsAprov: tema.corCardsAprov || this.coresAtivas.corCardsAprov,
            corCardsRecus: tema.corCardsRecus || this.coresAtivas.corCardsRecus
          };
          this.aoAlterarCor();
          this.cdr.detectChanges();
        }
      },
      error: () => {}
    });
  }

  get ambienteSelecionado(): string {
    return this.config.nomeExibido.replace(/^Colégio\s+/i, '') || 'Santo Américo';
  }

  selecionarTela(id: string): void {
    this.config.telaSelecionada = id;
  }

  aoAlterarCor(): void {
    this.themeService.aplicarVariaveisCss(this.coresAtivas);
    if (this.previewDevice) {
      this.previewDevice.aplicarCoresNoIframe();
    }
  }

  restaurarPadrao(): void {
    this.coresAtivas = {
      corPrimaria: '#0066FF',
      corNavbar: '#001F54',
      corCardsPend: '#F59E0B',
      corCardsAprov: '#10B981',
      corCardsRecus: '#EF4444'
    };
    this.aoAlterarCor();
  }

  publicarAlteracoes(): void {
    this.salvando = true;
    const payload: any = {
      ...this.coresAtivas,
      nomeInstituicao: this.config.nomeExibido
    };

    this.adminApi.salvarTema(payload).subscribe({
      next: () => {
        this.themeService.aplicarVariaveisCss(this.coresAtivas);
        this.salvando = false;
        alert('Identidade visual e cores publicadas com sucesso no MongoDB Atlas!');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao salvar tema:', err);
        this.salvando = false;
        alert('Não foi possível salvar as alterações. Verifique o back-end.');
        this.cdr.detectChanges();
      }
    });
  }
}