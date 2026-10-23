import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificacoesService } from '../../notificacoes/services/notificacoes.service';

export type StatusAnalise = 'PENDENTE' | 'APROVADO' | 'REJEITADO';

export interface SolicitacaoDetalhada {
  id: string;
  matricula: string;
  aluno: string;
  curso?: string;
  motivo: string;
  descricao?: string;
  dataEnvio: string;
  turno?: string;
  turma?: string;
  professor?: string;
  comImagem: boolean;
  imagemUrl?: string;
}

@Component({
  selector: 'app-solicitacoes-sec',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitacoesS.html',
  styleUrl: './solicitacoesS.css'
})
export class SolicitacoesSec implements OnInit {
  termoMatricula: string = '';
  solicitacaoId: string = '1';
  statusAnalise: StatusAnalise = 'PENDENTE';
  
  // Propriedade local para gerir a justificativa no formulário/template
  justificativaSecretaria: string = '';
  carregando: boolean = true;

  solicitacao: SolicitacaoDetalhada = {
    id: '',
    matricula: '',
    aluno: '',
    curso: '',
    motivo: '',
    dataEnvio: '',
    comImagem: false
  };

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly notificacoesService: NotificacoesService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.solicitacaoId = idParam;
      this.carregarSolicitacao(idParam);
    }
  }

  carregarSolicitacao(id: string): void {
    this.carregando = true;

    // Utiliza o método buscarPorId disponível no seu NotificacoesService
    this.notificacoesService.buscarPorId(id).subscribe({
      next: (dados: any) => {
        if (dados) {
          const temImagem = !!(dados.imagemUrl || dados.anexo || dados.comImagem);

          this.solicitacao = {
            id: dados.id || id,
            matricula: dados.matricula || dados.alunoMatricula || '2024005678',
            aluno: dados.alunoNome || dados.aluno?.nome || 'Aluno Não Identificado',
            curso: dados.curso || dados.aluno?.curso || 'Enfermagem',
            motivo: dados.motivo || dados.titulo || 'Solicitação de Abono',
            descricao: dados.descricao || dados.observacao || '',
            dataEnvio: dados.dataEnvio 
              ? new Date(dados.dataEnvio).toLocaleDateString('pt-BR') 
              : '12/08/2026',
            turno: dados.turno || dados.aluno?.turno || 'Matutino',
            turma: dados.turma || dados.aluno?.turma || '8º Ano A',
            professor: dados.professor || dados.professorNome || 'Prof. Carlos Eduardo',
            comImagem: temImagem,
            imagemUrl: temImagem ? (dados.imagemUrl || dados.anexo) : undefined
          };

          if (dados.status) {
            const s = String(dados.status).toUpperCase();
            if (s.includes('APROV')) this.statusAnalise = 'APROVADO';
            else if (s.includes('REJEIT') || s.includes('INDEFER')) this.statusAnalise = 'REJEITADO';
            else this.statusAnalise = 'PENDENTE';
          }
        }
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Erro ao carregar detalhes:', err);
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  aprovarAtestado(): void {
    this.statusAnalise = 'APROVADO';
    const novoStatus = 'ENCAMINHADO_PROFESSOR';
    // Passa exatamente 2 argumentos (id e status) como definido no serviço
    this.notificacoesService.atualizarStatus(this.solicitacaoId, novoStatus).subscribe({
      next: () => this.cdr.detectChanges(),
      error: (err: any) => console.error('Erro ao aprovar:', err)
    });
  }

  rejeitarAtestado(): void {
    this.statusAnalise = 'REJEITADO';
    const novoStatus = 'REJEITADO';
    // Passa exatamente 2 argumentos (id e status) como definido no serviço
    this.notificacoesService.atualizarStatus(this.solicitacaoId, novoStatus).subscribe({
      next: () => this.cdr.detectChanges(),
      error: (err: any) => console.error('Erro ao rejeitar:', err)
    });
  }

  resetarAnalise(): void {
    this.statusAnalise = 'PENDENTE';
  }

  baixarComprovante(tipo: 'APROVADO' | 'REJEITADO'): void {
    let conteudo = '';
    let nomeArquivo = '';

    if (tipo === 'APROVADO') {
      nomeArquivo = `Comprovante_Aprovacao_${this.solicitacao.matricula}.txt`;
      conteudo = `=======================================\n` +
                 `   COMPROVANTE DE VALIDAÇÃO DE ATESTADO\n` +
                 `=======================================\n\n` +
                 `Status: ATESTADO VALIDADO\n` +
                 `Aluno: ${this.solicitacao.aluno}\n` +
                 `Matrícula: ${this.solicitacao.matricula}\n` +
                 `Curso: ${this.solicitacao.curso}\n` +
                 `Justificativa: ${this.justificativaSecretaria || 'Nenhuma informada'}\n`;
    } else {
      nomeArquivo = `Comprovante_Rejeicao_${this.solicitacao.matricula}.txt`;
      conteudo = `=======================================\n` +
                 `  COMPROVANTE DE NÃO VALIDAÇÃO DE ATESTADO\n` +
                 `=======================================\n\n` +
                 `Status: ATESTADO NÃO VALIDADO (REJEITADO)\n` +
                 `Aluno: ${this.solicitacao.aluno}\n` +
                 `Matrícula: ${this.solicitacao.matricula}\n` +
                 `Justificativa: ${this.justificativaSecretaria || 'Sem justificativa'}\n`;
    }

    this.executarDownload(nomeArquivo, conteudo);
  }

  baixarOriginal(): void {
    const conteudo = `Atestado Médico Original - Aluno: ${this.solicitacao.aluno}`;
    this.executarDownload(`Atestado_Original_${this.solicitacao.matricula}.txt`, conteudo);
  }

  private executarDownload(nomeArquivo: string, conteudo: string): void {
    const blob = new Blob([conteudo], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nomeArquivo;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  voltarDashboard(): void {
    this.router.navigate(['/secretaria/dashboard']);
  }
}