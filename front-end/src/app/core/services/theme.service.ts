import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface TemaConfig {
  logoUrl?: string;
  nomeExibido?: string;
  dominioPersonalizado?: string;
  corPrimaria: string;
  corNavbar: string;
  corCardsPend: string;
  corCardsAprov: string;
  corCardsRecus: string;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private apiUrl = 'http://localhost:3000/admin-ti/config';
  public logo$ = new BehaviorSubject<string>('assets/logo-onclass-padrao.png');

  constructor(private http: HttpClient) {}

  carregarEAplicarTema(): void {
    this.http.get<TemaConfig>(this.apiUrl).subscribe({
      next: (config) => {
        if (config) {
          this.aplicarVariaveisCss(config);
          if (config.logoUrl) {
            this.logo$.next(config.logoUrl);
          }
        }
      },
      error: () => console.log('Utilizando tema padrão.')
    });
  }

  salvarTema(config: TemaConfig): Observable<any> {
    return this.http.put(`${this.apiUrl}/tema`, config).pipe(
      tap(() => {
        // Aplica imediatamente na árvore DOM (:root) para todos os perfis
        this.aplicarVariaveisCss(config);
        if (config.logoUrl) {
          this.logo$.next(config.logoUrl);
        }
      })
    );
  }

 public aplicarVariaveisCss(config: Partial<TemaConfig>, targetRoot?: HTMLElement): void {
    const root = targetRoot || (typeof document !== 'undefined' ? document.documentElement : null);
    if (!root) return;
    
    if (config.corPrimaria) {
      root.style.setProperty('--primary-color', config.corPrimaria);
    }
    if (config.corNavbar || config.corPrimaria) {
      root.style.setProperty('--navbar-bg', config.corNavbar || config.corPrimaria!);
    }
    if (config.corCardsPend) {
      root.style.setProperty('--card-pend-color', config.corCardsPend);
      root.style.setProperty('--card-pendente-bg', config.corCardsPend);
    }
    if (config.corCardsAprov) {
      root.style.setProperty('--card-aprov-color', config.corCardsAprov);
      root.style.setProperty('--card-aprovado-bg', config.corCardsAprov);
    }
    if (config.corCardsRecus) {
      root.style.setProperty('--card-recus-color', config.corCardsRecus);
      root.style.setProperty('--card-recusado-bg', config.corCardsRecus);
    }
  }

  /**
   * Injeta as variáveis CSS diretamente dentro do <iframe> de prévia em tempo real
   */
  public aplicarPreviewNoIframe(iframe: HTMLIFrameElement | null, config: Partial<TemaConfig>): void {
    try {
      const iframeRoot = iframe?.contentDocument?.documentElement || iframe?.contentWindow?.document?.documentElement;
      if (iframeRoot) {
        this.aplicarVariaveisCss(config, iframeRoot);
      }
    } catch (e: unknown) {
      console.warn('Não foi possível acessar o DOM do iframe ainda:', e);
    }
  }
}