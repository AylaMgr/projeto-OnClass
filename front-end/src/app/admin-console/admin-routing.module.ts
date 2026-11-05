import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PersonalizacaoComponent } from './pages/personalizacao/personalizacao';
import { EquipeComponent } from './pages/equipes/equipe';
import { SuporteComponent } from './pages/suporte/suporte';
import { TelemetriaComponent } from './pages/telemetria/telemetria';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'personalizacao',
    pathMatch: 'full'
  },
  {
    path: 'personalizacao',
    component: PersonalizacaoComponent
  },
  {
    path: 'equipe',
    component: EquipeComponent
  },
  {
    path: 'suporte',
    component: SuporteComponent
  },
  {
    path: 'telemetria',
    component: TelemetriaComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }