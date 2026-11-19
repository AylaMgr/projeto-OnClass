import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TemaConfig } from './theme.service';

export interface NovoUsuarioPayload {
  nome: string;
  email: string;
  dataNascimento: string;
  role: string;
  matricula: string;
  turmas?: string[];
  senha?: string;
}

export interface NovoContatoPayload {
  nome: string;
  telefone: string;
  setor: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminApiService {
  private readonly baseUrl = 'http://localhost:3000/admin-ti';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('access_token') ||
      localStorage.getItem('auth_token') ||
      '';

    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  // Telemetria
  obterTelemetria(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/telemetria`, {
      headers: this.getHeaders(),
    });
  }

  // Suporte
  obterContatosSuporte(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/suporte`, {
      headers: this.getHeaders(),
    });
  }

  cadastrarContatoSuporte(contato: NovoContatoPayload): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/suporte`, contato, {
      headers: this.getHeaders(),
    });
  }

  // Usuários / Equipe
  obterUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/usuarios`, {
      headers: this.getHeaders(),
    });
  }

  cadastrarUsuario(usuario: NovoUsuarioPayload): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/usuarios`, usuario, {
      headers: this.getHeaders(),
    });
  }

  // Personalização White-Label
  obterTema(): Observable<TemaConfig> {
    return this.http.get<TemaConfig>(`${this.baseUrl}/config/tema`, {
      headers: this.getHeaders(),
    });
  }

  salvarTema(tema: TemaConfig): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/config/tema`, tema, {
      headers: this.getHeaders(),
    });
  }

  uploadLogo(arquivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', arquivo);
    return this.http.post<any>(`${this.baseUrl}/config/logo`, formData, {
      headers: this.getHeaders(),
    });
  }

  atualizarContatoSuporte(id: string, contato: Partial<NovoContatoPayload>): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/suporte/${id}`, contato, {
      headers: this.getHeaders(),
    });
  }

  removerContatoSuporte(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/suporte/${id}`, {
      headers: this.getHeaders(),
    });
  }
}