import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface TemaConfig {
  logoUrl?: string;
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

  public aplicarVariaveisCss(config: TemaConfig): void {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', config.corPrimaria);
    root.style.setProperty('--navbar-bg', config.corNavbar || config.corPrimaria);
    root.style.setProperty('--card-pendente-bg', config.corCardsPend);
    root.style.setProperty('--card-aprovado-bg', config.corCardsAprov);
    root.style.setProperty('--card-recusado-bg', config.corCardsRecus);
  }
}