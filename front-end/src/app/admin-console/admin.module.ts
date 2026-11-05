import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AdminRoutingModule } from './admin-routing.module';

// Páginas
import { PersonalizacaoComponent } from './pages/personalizacao/personalizacao';
import { EquipeComponent } from './pages/equipes/equipe';
import { SuporteComponent } from './pages/suporte/suporte';
import { TelemetriaComponent } from './pages/telemetria/telemetria';

// Componente da Prévia Interativa
import { PreviewDeviceComponent } from './preview-device/preview-device';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    AdminRoutingModule,
    PersonalizacaoComponent,
    EquipeComponent,
    SuporteComponent,
    TelemetriaComponent,
    PreviewDeviceComponent
  ]
})
export class AdminModule { }