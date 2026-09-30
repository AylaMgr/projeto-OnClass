import { Routes } from '@angular/router';
import { LoginComponent } from './modules/autenticacao/login/login';

// Imports dos dashboards específicos
import { Dashboard } from './modules/notificacoes/components/dashboard/dashboardAluno/dashboard';
import { DashboardS } from './modules/notificacoes/components/dashboard/dashboardSec/dashboardS';
// import { DashboardP } from './modules/dashboard/dashboardProf/dashboardP'; // Quando implementar o do professor

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  // Rotas por perfil
  { path: 'dashboard-aluno', component: Dashboard },
  { path: 'dashboard-secretaria', component: DashboardS },
  // { path: 'dashboard-professor', component: DashboardP },

  // Redirecionamento genérico (opcional, pode apontar para o aluno ou secretaria)
  { path: 'dashboard', redirectTo: 'dashboard-aluno', pathMatch: 'full' }
];