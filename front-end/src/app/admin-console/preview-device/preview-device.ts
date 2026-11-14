import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ThemeService } from '../../core/services/theme.service';
import { TemaConfig } from '../../core/services/theme.service';

@Component({
  selector: 'app-preview-device',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preview-device.html',
  styleUrls: ['./preview-device.css']
})
export class PreviewDeviceComponent implements OnChanges {
  @Input() cores!: TemaConfig;
  @Input() telaSelecionada: string = 'dashboard_aluno';

  @ViewChild('previewIframe') previewIframe!: ElementRef<HTMLIFrameElement>;

  iframeUrlSafe!: SafeResourceUrl;
  rotaAtual: string = '/aluno/dashboard';

  private readonly mapaRotas: { [key: string]: string } = {
    'login': '/login',
    'dashboard_sec': '/secretaria/dashboard',
    'analises_manuais': '/secretaria/analises-manuais',
    'solicitacoes_sec': '/secretaria/solicitacoes',
    'dashboard_aluno': '/aluno/dashboard',
    'dashboard_prof': '/professor/dashboard',
    'solicitacoes_prof': '/professor/solicitacoes/1'
  };

  constructor(
    private sanitizer: DomSanitizer,
    private themeService: ThemeService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['telaSelecionada']) {
      this.atualizarIframeUrl();
    }
    if (changes['cores']) {
      this.aplicarCoresNoIframe();
    }
  }

  private atualizarIframeUrl(): void {
    this.rotaAtual = this.mapaRotas[this.telaSelecionada] || '/aluno/dashboard';
    const fullUrl = `${window.location.origin}${this.rotaAtual}`;
    this.iframeUrlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(fullUrl);
  }

  aoCarregarIframe(): void {
    this.aplicarCoresNoIframe();
  }

public aplicarCoresNoIframe(): void {
    if (!this.cores || !this.previewIframe?.nativeElement) return;

    try {
      const iframeDoc =
        this.previewIframe.nativeElement.contentDocument ||
        this.previewIframe.nativeElement.contentWindow?.document;

      if (iframeDoc?.documentElement) {
        const root = iframeDoc.documentElement;
        if (this.cores.corPrimaria) {
          root.style.setProperty('--primary-color', this.cores.corPrimaria);
        }
        if (this.cores.corNavbar || this.cores.corPrimaria) {
          root.style.setProperty('--navbar-bg', this.cores.corNavbar || this.cores.corPrimaria);
        }
        if (this.cores.corCardsPend) {
          root.style.setProperty('--card-pend-color', this.cores.corCardsPend);
          root.style.setProperty('--card-pendente-bg', this.cores.corCardsPend);
        }
        if (this.cores.corCardsAprov) {
          root.style.setProperty('--card-aprov-color', this.cores.corCardsAprov);
          root.style.setProperty('--card-aprovado-bg', this.cores.corCardsAprov);
        }
        if (this.cores.corCardsRecus) {
          root.style.setProperty('--card-recus-color', this.cores.corCardsRecus);
          root.style.setProperty('--card-recusado-bg', this.cores.corCardsRecus);
        }
      }
    } catch (e: unknown) {
      console.warn('Sincronização direta de iframe:', e);
    }
  }
}