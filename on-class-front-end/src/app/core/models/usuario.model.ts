export type Role = 'ALUNO' | 'PROFESSOR' | 'SECRETARIA';

export interface Usuario {
  id: string;
  email: string;
  nome?: string;
  role: Role;
}