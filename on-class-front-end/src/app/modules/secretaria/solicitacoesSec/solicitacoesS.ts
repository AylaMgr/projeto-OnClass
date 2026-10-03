import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

export type StatusAnalise = 'PENDENTE' | 'APROVADO' | 'REJEITADO';

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
  justificativaSecretaria: string = '';

  solicitacao = {
    id: '1',
    matricula: '2024005678',
    aluno: 'Maria Silva',
    curso: 'Enfermagem',
    motivo: 'Solicitação de Abono: Atestado Médico',
    dataEnvio: '12/08/2026'
  };

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.solicitacaoId = idParam;
    }
  }

  aprovarAtestado(): void {
    this.statusAnalise = 'APROVADO';
  }

  rejeitarAtestado(): void {
    this.statusAnalise = 'REJEITADO';
  }

  resetarAnalise(): void {
    this.statusAnalise = 'PENDENTE';
  }

  baixarComprovante(tipo: 'APROVADO' | 'REJEITADO'): void {
    let conteudo = '';
    let nomeArquivo = '';

    if (tipo === 'APROVADO') {
      nomeArquivo = `Comprovante_Aprovacao_${this.solicitacao.matricula}.txt`;
      conteudo = `=================================================\n` +
                 `       COMPROVANTE DE VALIDAÇÃO DE ATESTADO     \n` +
                 `=================================================\n\n` +
                 `Status: ATESTADO VALIDADO\n` +
                 `Aluno: ${this.solicitacao.aluno}\n` +
                 `Matrícula: ${this.solicitacao.matricula}\n` +
                 `Curso: ${this.solicitacao.curso}\n` +
                 `Data da Validação: 11/08/2026\n` +
                 `Assinatura Médica: Verificada\n` +
                 `CRM Profissional: 12345-SP\n` +
                 `Período Aprovado: 3 dias\n` +
                 `Justificativa: ${this.justificativaSecretaria || 'Nenhuma informada'}\n\n` +
                 `O documento cumpre todas as exigências institucionais.`;
    } else {
      nomeArquivo = `Comprovante_Rejeicao_${this.solicitacao.matricula}.txt`;
      conteudo = `=================================================\n` +
                 `     COMPROVANTE DE NÃO VALIDAÇÃO DE ATESTADO    \n` +
                 `=================================================\n\n` +
                 `Status: ATESTADO NÃO VALIDADO (REJEITADO)\n` +
                 `Aluno: ${this.solicitacao.aluno}\n` +
                 `Matrícula: ${this.solicitacao.matricula}\n` +
                 `Curso: ${this.solicitacao.curso}\n` +
                 `Data do Parecer: 11/08/2026\n\n` +
                 `PROBLEMAS DETECTADOS PELA IA:\n` +
                 `- Assinatura médica: Não detectada ou ilegível\n` +
                 `- CRM do profissional: Ausente no cabeçalho/corpo\n` +
                 `- Carimbo do Médico: Não identificado\n\n` +
                 `JUSTIFICATIVA DA SECRETARIA:\n` +
                 `${this.justificativaSecretaria || 'Documento com baixa qualidade de imagem ou fora das normas.'}\n\n` +
                 `Por favor, envie um documento corrigido.`;
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