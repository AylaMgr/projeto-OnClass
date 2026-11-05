import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService, TemaConfig } from '../../../core/services/theme.service';
import { PreviewDeviceComponent } from '../../preview-device/preview-device';

@Component({
  selector: 'app-personalizacao',
  standalone: true,
  imports: [CommonModule, FormsModule, PreviewDeviceComponent],
  templateUrl: './personalizacao.html',
  styleUrls: ['./personalizacao.css']
})
export class PersonalizacaoComponent implements OnInit {
  @ViewChild(PreviewDeviceComponent) previewDevice!: PreviewDeviceComponent;

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
    { id: 'login', nome: 'Login' },
    { id: 'dashboard_sec', nome: 'Dashboard Secretaria' },
    { id: 'analises_manuais', nome: 'Análises Manuais' },
    { id: 'solicitacoes_sec', nome: 'Solicitações Secretaria' },
    { id: 'dashboard_aluno', nome: 'Dashboard Aluno' },
    { id: 'dashboard_prof', nome: 'Dashboard Professor' },
    { id: 'solicitacoes_prof', nome: 'Solicitações Professor' }
  ];

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.themeService.carregarEAplicarTema();
  }

  selecionarTela(id: string): void {
    this.config.telaSelecionada = id;
  }

  aoAlterarCor(): void {
    // Aplica no DOM global
    this.themeService.aplicarVariaveisCss(this.coresAtivas);
    // Força sincronização instantânea com a tela dentro do iframe
    if (this.previewDevice) {
      this.previewDevice.aplicarCoresNoIframe();
    }
  }

  publicarAlteracoes(): void {
    this.themeService.salvarTema(this.coresAtivas).subscribe({
      next: () => alert('Alterações salvas e publicadas com sucesso!'),
      error: (err) => console.error('Erro ao salvar tema:', err)
    });
  }
}