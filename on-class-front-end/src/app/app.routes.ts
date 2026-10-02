import { Routes } from '@angular/router';

// Autenticação
import { LoginComponent } from './modules/autenticacao/login/login';

// Aluno
import { Dashboard } from './modules/aluno/dashboardAluno/dashboard';
import { SolicitacoesStatus } from './modules/aluno/solicitacoesStatus/solicitacoesStatus';

// Professor
import { DashboardP } from './modules/professor/dashboardProf/dashboardP';
import { SolicitacoesP } from './modules/professor/solicitacoesProf/solicitacoesP';

// Secretaria
import { DashboardS } from './modules/secretaria/dashboardSec/dashboardS';
import { SolicitacoesSec } from './modules/secretaria/solicitacoesSec/solicitacoesS';
import { AnalisesManuais } from './modules/secretaria/analisesManuais/analisesManuais';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  // Rotas do Aluno
  { path: 'aluno/dashboard', component: Dashboard },
  { path: 'aluno/solicitacao/:id', component: SolicitacoesSec },

  // Rotas do Professor
  { path: 'professor/dashboard', component: DashboardP },
  { path: 'professor/solicitacao/:id', component: SolicitacoesP },

  // Rotas da Secretaria
  { path: 'secretaria/dashboard', component: DashboardS },
  { path: 'secretaria/recebidos', component: AnalisesManuais },
  { path: 'secretaria/analises-manuais', component: AnalisesManuais },
  { path: 'secretaria/solicitacoes', component: SolicitacoesSec },
  { path: 'secretaria/solicitacao/:id', component: SolicitacoesSec },

  // Redirecionamentos (AQUI DENTRO DO ARRAY DE ROTAS)
  { path: 'dashboard-aluno', redirectTo: 'aluno/dashboard', pathMatch: 'full' },
  { path: 'dashboard-secretaria', redirectTo: 'secretaria/dashboard', pathMatch: 'full' }
];