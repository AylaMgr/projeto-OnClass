import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CriarNotificacaoDto {
  alunoId?: string;
  motivo: string;
  dataInicio: string;
  dataFim: string;
  descricao: string;
  declaracaoVeracidade: boolean;
}

export interface Notificacao {
  id: string;
  alunoId: string;
  tipo: string;
  motivo: string;
  dataInicio: string;
  dataFim: string;
  descricao: string;
  declaracaoVeracidade: boolean;
  status: string;
  administrador: string;
  dataEnvio: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificacoesService {
  private readonly apiUrl = 'http://localhost:3000/notificacoes';

  constructor(private readonly http: HttpClient) {}

  criar(dto: CriarNotificacaoDto): Observable<any> {
    return this.http.post<any>(this.apiUrl, dto);
  }

  listarRecentes(): Observable<Notificacao[]> {
    return this.http.get<Notificacao[]>(`${this.apiUrl}/recentes`);
  }

  listarPorAluno(alunoId: string): Observable<Notificacao[]> {
    return this.http.get<Notificacao[]>(`${this.apiUrl}/aluno/${alunoId}`);
  }

  buscarPorId(id: string): Observable<Notificacao> {
    return this.http.get<Notificacao>(`${this.apiUrl}/${id}`);
  }

  atualizarStatus(id: string, status: string): Observable<Notificacao> {
    return this.http.patch<Notificacao>(`${this.apiUrl}/${id}/status`, { status });
  }
}