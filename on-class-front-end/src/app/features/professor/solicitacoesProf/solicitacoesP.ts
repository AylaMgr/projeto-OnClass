import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

export type StatusDecisaoProfessor = 'PENDENTE' | 'ACEITO' | 'RECUSADO';

@Component({
  selector: 'app-solicitacoes-prof',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitacoesP.html',
  styleUrl: './solicitacoesP.css'
})
export class SolicitacoesP implements OnInit {

  termoMatricula: string = '';
  solicitacaoId: string = '1';
  statusDecisao: StatusDecisaoProfessor = 'PENDENTE';
  observacaoProfessor: string = '';

  solicitacao = {
    id: '1',
    matricula: '2024001234',
    aluno: 'Mariana Souza Santos',
    turma: '8º Ano A',
    turno: 'Matutino',
    disciplina: 'História',
    motivo: 'Solicitação de Abono: Atestado Médico',
    dataEnvio: '12/08/2026',
    diasAtestado: 3,
    faltasAbonar: 4
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

  aceitarAbono(): void {
    this.statusDecisao = 'ACEITO';
  }

  recusarAbono(): void {
    this.statusDecisao = 'RECUSADO';
  }

  resetarDecisao(): void {
    this.statusDecisao = 'PENDENTE';
  }

  baixarComprovante(tipo: 'ACEITO' | 'RECUSADO'): void {
    let conteudo = '';
    let nomeArquivo = '';

    if (tipo === 'ACEITO') {
      nomeArquivo = `Comprovante_Abono_Deferido_${this.solicitacao.matricula}.txt`;
      conteudo = `=================================================\n` +
                 `      PARECER DOCENTE: ABONO DE FALTA DEFERIDO   \n` +
                 `=================================================\n\n` +
                 `Status: ABONO ACEITO\n` +
                 `Aluno: ${this.solicitacao.aluno}\n` +
                 `Matrícula: ${this.solicitacao.matricula}\n` +
                 `Turma/Turno: ${this.solicitacao.turma} (${this.solicitacao.turno})\n` +
                 `Disciplina: ${this.solicitacao.disciplina}\n` +
                 `Faltas Abonadas: ${this.solicitacao.faltasAbonar} Aulas\n` +
                 `Observação do Professor: ${this.observacaoProfessor || 'Nenhuma informada'}\n\n` +
                 `Declaro que as faltas referentes ao atestado apresentado foram devidamente abonadas no diário de classe.`;
    } else {
      nomeArquivo = `Comprovante_Abono_Indeferido_${this.solicitacao.matricula}.txt`;
      conteudo = `=================================================\n` +
                 `     PARECER DOCENTE: ABONO DE FALTA INDEFERIDO  \n` +
                 `=================================================\n\n` +
                 `Status: ABONO RECUSADO\n` +
                 `Aluno: ${this.solicitacao.aluno}\n` +
                 `Matrícula: ${this.solicitacao.matricula}\n` +
                 `Turma/Turno: ${this.solicitacao.turma} (${this.solicitacao.turno})\n` +
                 `Disciplina: ${this.solicitacao.disciplina}\n` +
                 `Justificativa do Indeferimento:\n` +
                 `${this.observacaoProfessor || 'Documentação incompatível com a pauta de frequência da disciplina.'}\n\n` +
                 `A solicitação de abono não foi aceita para o diário de classe.`;
    }

    this.executarDownload(nomeArquivo, conteudo);
  }

  baixarOriginal(): void {
    const conteudo = `Atestado Médico Enviado pelo Aluno - ${this.solicitacao.aluno}`;
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
    this.router.navigate(['/professor/dashboard']);
  }
}