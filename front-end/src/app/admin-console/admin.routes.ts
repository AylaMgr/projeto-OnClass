import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'personalizacao',
    pathMatch: 'full'
  },
  {
    path: 'personalizacao',
    loadComponent: () => import('./pages/personalizacao/personalizacao').then(m => m.PersonalizacaoComponent)
  },
  {
    path: 'equipe',
    loadComponent: () => import('./pages/equipes/equipe').then(m => m.EquipeComponent)
  },
  {
    path: 'suporte',
    loadComponent: () => import('./pages/suporte/suporte').then(m => m.SuporteComponent)
  },
  {
    path: 'telemetria',
    loadComponent: () => import('./pages/telemetria/telemetria').then(m => m.TelemetriaComponent)
  }
];