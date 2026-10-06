import { Usuario } from './usuario.model';

export interface AuthResponse {
  accessToken: string;
  user?: Usuario;
}