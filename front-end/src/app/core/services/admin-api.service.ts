import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TemaConfig } from './theme.service';

export interface NovoUsuarioPayload {
  nome: string;
  email: string;
  dataNascimento: string;
  role: string;
  matricula: string;
}

export interface NovoContatoPayload {
  nome: string;
  telefone: string;
  setor: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminApiService {
  private readonly baseUrl = 'http://localhost:3000/admin-ti';

  constructor(private http: HttpClient) {}

  // Telemetria
  obterTelemetria(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/telemetria`);
  }

  // Suporte
  obterContatosSuporte(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/suporte`);
  }

  cadastrarContatoSuporte(contato: NovoContatoPayload): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/suporte`, contato);
  }

  // Usuários / Equipe
  obterUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/usuarios`);
  }

  cadastrarUsuario(usuario: NovoUsuarioPayload): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/usuarios`, usuario);
  }
}