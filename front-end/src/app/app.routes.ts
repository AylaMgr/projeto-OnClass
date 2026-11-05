import { Routes } from '@angular/router';

// Autenticação
import { LoginComponent } from './features/login/login';

// Aluno
import { Dashboard } from './features/aluno/dashboardAluno/dashboard';

// Professor
import { DashboardP } from './features/professor/dashboardProf/dashboardP';
import { SolicitacoesProf } from './features/professor/solicitacoesProf/solicitacoesP';

// Secretaria
import { Dashboards } from './features/secretaria/dashboardSec/dashboardS';
import { SolicitacoesSec } from './features/secretaria/solicitacoesSec/solicitacoesS';
import { AnalisesManuais } from './features/secretaria/analisesManuais/analisesManuais';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  // Rotas do Aluno
  { path: 'aluno/dashboard', component: Dashboard },

  // Rotas do Professor
  { path: 'professor/dashboard', component: DashboardP },
  { path: 'professor/solicitacoes/:id', component: SolicitacoesProf },

  // Rotas da Secretaria
  { path: 'secretaria/dashboard', component: Dashboards },
  { path: 'secretaria/recebidos', component: AnalisesManuais },
  { path: 'secretaria/analises-manuais', component: AnalisesManuais },
  { path: 'secretaria/solicitacoes', component: SolicitacoesSec },
  { path: 'secretaria/solicitacao/:id', component: SolicitacoesSec },

  // Redirecionamentos
  { path: 'dashboard-aluno', redirectTo: 'aluno/dashboard', pathMatch: 'full' },
  { path: 'dashboard-secretaria', redirectTo: 'secretaria/dashboard', pathMatch: 'full' },
  { path: 'dashboard-professor', redirectTo: 'professor/dashboard', pathMatch: 'full' },
  { path: 'dashboardProfessor', redirectTo: 'professor/dashboard', pathMatch: 'full' },

  // Redirecionamento da URL antiga /admin-ti
  { path: 'admin-ti', redirectTo: 'admin', pathMatch: 'full' },

  // Nova rota centralizada do Admin Console
  {
    path: 'admin',
    loadChildren: () => import('./admin-console/admin.routes').then(m => m.ADMIN_ROUTES)
  }
];