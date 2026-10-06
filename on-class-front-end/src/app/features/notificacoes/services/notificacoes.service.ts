import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  dataFim: string;
  descricao: string;
  declaracaoVeracidade: boolean;
  status: string;
  administrador?: string;
  dataEnvio: string;
  alunoNome?: string;
  matricula?: string;
  turma?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificacoesService {
  private readonly apiUrl = 'http://localhost:3000/notificacoes';

  // 1. Canal do RxJS para transmitir o aviso de que uma notificação foi criada
  private notificacaoCriadaSubject = new Subject<void>();
  notificacaoCriada$ = this.notificacaoCriadaSubject.asObservable();

  constructor(private readonly http: HttpClient) {}
  listarTodasParaSecretaria(): Observable<Notificacao[]> {
    return this.http.get<Notificacao[]>(this.apiUrl);
  }
  // 2. Método para disparar a atualização para os painéis
  notificarMudanca(): void {
    this.notificacaoCriadaSubject.next();
  }

  criar(dto: CriarNotificacaoDto): Observable<any> {
    return this.http.post<any>(this.apiUrl, dto);
  }

  listarRecentes(): Observable<Notificacao[]> {
    return this.http.get<Notificacao[]>(`${this.apiUrl}/recentes`);
  }

  listarPorAluno(alunoId: string): Observable<Notificacao[]> {
    return this.http.get<Notificacao[]>(`${this.apiUrl}/aluno/${alunoId}`);
  }

  listarTodas(): Observable<Notificacao[]> {
  return this.http.get<Notificacao[]>(this.apiUrl);
}

  buscarPorId(id: string): Observable<Notificacao> {
    return this.http.get<Notificacao>(`${this.apiUrl}/${id}`);
  }

  atualizarStatus(id: string, status: string): Observable<Notificacao> {
    return this.http.patch<Notificacao>(`${this.apiUrl}/${id}/status`, { status });
  }
}