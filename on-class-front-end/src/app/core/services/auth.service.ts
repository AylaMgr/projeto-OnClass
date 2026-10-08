import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse } from '../models/auth-response.model';
import { Role } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:3000/auth'; 
  private readonly TOKEN_KEY = 'auth_token';

  /**
   * Realiza o login na API NestJS e armazena o token de acesso
   */
  login(credentials: { email: string; pass: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap((res) => {
        if (res && res.accessToken) {
          this.setToken(res.accessToken);
        }
      })
    );
  }

  /**
   * Remove o token e desconecta o utilizador
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  /**
   * Guarda o JWT no localStorage
   */
  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Obtém o token JWT guardado
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Verifica se o utilizador está autenticado
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /**
   * Decodifica o payload do JWT e retorna a Role do utilizador (ALUNO, PROFESSOR ou SECRETARIA)
   */
  getUserRole(): Role | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      // O JWT possui 3 partes separadas por ponto: Header.Payload.Signature
      const payloadBase64 = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      
      // Retorna a propriedade contendo a role no token (ajuste a chave se no NestJS for role/roles)
      return (decodedPayload.role || decodedPayload.roles) as Role;
    } catch (error) {
      console.error('Erro ao decodificar o token JWT:', error);
      return null;
    }
  }
}