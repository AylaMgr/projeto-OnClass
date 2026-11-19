import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

export interface CriarNotificacaoDto {
  alunoId?: string;
  motivo: string;
  dataInicio: string;
  dataFim: string;
  descricao: string;
  declaracaoVeracidade: boolean;
}

export interface Notificacao {
  id?: number | string;
  alunoId: string;
  tipo: string;
  motivo: string;
  dataInicio: string;
  horarioEnvio?: string;
  dataFim: string;
  descricao: string;
  declaracaoVeracidade: boolean;
  status: string;
  administrador?: string;
  dataEnvio?: string;
  criadoEm?: string;
  createdAt?: string;
  alunoNome?: string;
  matricula?: string;
  turma?: string;
  temUpload?: boolean;
  arquivoUrl?: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificacoesService {
  private readonly apiUrl = 'http://localhost:3000/notificacoes';

  // 1. Canal do RxJS para transmitir o aviso de que uma notificação foi criada
  private notificacaoCriadaSubject = new Subject<void>();
  notificacaoCriada$ = this.notificacaoCriadaSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  listarTodasParaSecretaria(): Observable<Notificacao[]> {
    return this.http.get<Notificacao[]>(this.apiUrl, {
      headers: this.getAuthHeaders(),
    });
  }

  // 2. Método para disparar a atualização para os painéis
  notificarMudanca(): void {
    this.notificacaoCriadaSubject.next();
  }

  criar(dto: CriarNotificacaoDto): Observable<any> {
    return this.http.post<any>(this.apiUrl, dto, {
      headers: this.getAuthHeaders(),
    });
  }

  listarRecentes(): Observable<Notificacao[]> {
    return this.http.get<Notificacao[]>(`${this.apiUrl}/recents`, {
      headers: this.getAuthHeaders(),
    });
  }

  listarPorAluno(alunoId: string): Observable<Notificacao[]> {
    return this.http.get<Notificacao[]>(`${this.apiUrl}/aluno/${alunoId}`, {
      headers: this.getAuthHeaders(),
    });
  }

  listarTodas(): Observable<Notificacao[]> {
    return this.http.get<Notificacao[]>(this.apiUrl, {
      headers: this.getAuthHeaders(),
    });
  }

  buscarPorId(id: string): Observable<Notificacao> {
    return this.http.get<Notificacao>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  atualizarStatus(id: string, status: string): Observable<Notificacao> {
    return this.http.patch<Notificacao>(
      `${this.apiUrl}/${id}/status`,
      { status },
      { headers: this.getAuthHeaders() },
    );
  }
}