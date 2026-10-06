import { Routes } from '@angular/router';

// Autenticação
import { LoginComponent } from './features/login/login';

// Aluno
import { Dashboard } from './features/aluno/dashboardAluno/dashboard';
import { SolicitacoesStatus } from './features/aluno/solicitacoesStatus/solicitacoesStatus';

// Professor
import { DashboardP } from './features/professor/dashboardProf/dashboardP';
import { SolicitacoesP } from './features/professor/solicitacoesProf/solicitacoesP';

// Secretaria
import { DashboardS } from './features/secretaria/dashboardSec/dashboardS';
import { SolicitacoesSec } from './features/secretaria/solicitacoesSec/solicitacoesS';
import { AnalisesManuais } from './features/secretaria/analisesManuais/analisesManuais';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  // Rotas do Aluno
  { path: 'aluno/dashboard', component: Dashboard },
  { path: 'aluno/solicitacao/:id', component: SolicitacoesStatus },

  // Rotas do Professor (CORRIGIDO: sem a barra no final)
  { path: 'professor/dashboard', component: DashboardP },
  { path: 'professor/solicitacao/:id', component: SolicitacoesP },

  // Rotas da Secretaria
  { path: 'secretaria/dashboard', component: DashboardS },
  { path: 'secretaria/recebidos', component: AnalisesManuais },
  { path: 'secretaria/analises-manuais', component: AnalisesManuais },
  { path: 'secretaria/solicitacoes', component: SolicitacoesSec },
  { path: 'secretaria/solicitacao/:id', component: SolicitacoesSec },

  // Redirecionamentos
  { path: 'dashboard-aluno', redirectTo: 'aluno/dashboard', pathMatch: 'full' },
  { path: 'dashboard-secretaria', redirectTo: 'secretaria/dashboard', pathMatch: 'full' },
  { path: 'dashboard-professor', redirectTo: 'professor/dashboard', pathMatch: 'full' },
  { path: 'dashboardProfessor', redirectTo: 'professor/dashboard', pathMatch: 'full' }
];