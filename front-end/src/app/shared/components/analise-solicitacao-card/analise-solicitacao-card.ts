import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ItemChecklistIa {
  label: string;
  detalhe: string;
  valido: boolean;
}

export interface DadosAnaliseSolicitacao {
  id?: string;
  alunoNome: string;
  alunoMatricula?: string;
  alunoCurso?: string;
  tipoJustificativa: string;
  periodoSolicitado: string;
  possuiAnexo: boolean;
  statusBadgeHeader: string;
  justificativaTexto?: string;
  confiancaIa?: number;
  statusParecerIa?: string;
  parecerTipo?: 'aprovado' | 'atencao' | 'rejeitado';
  checklist?: ItemChecklistIa[];
  observacaoIa?: string;
  exibirAlertaLeitura?: boolean;
  arquivoUrl?: string;
}

@Component({
  selector: 'app-analise-solicitacao-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './analise-solicitacao-card.html',
  styleUrls: ['./analise-solicitacao-card.css'],
})
export class AnaliseSolicitacaoCard {
  @Input() perfil: 'ALUNO' | 'SECRETARIA' | 'PROFESSOR' = 'ALUNO';
  @Input({ required: true }) dados!: DadosAnaliseSolicitacao;

  @Output() verOriginal = new EventEmitter<DadosAnaliseSolicitacao>();
  @Output() aprovar = new EventEmitter<{ dados: DadosAnaliseSolicitacao; justificativa: string }>();
  @Output() recusar = new EventEmitter<{ dados: DadosAnaliseSolicitacao; justificativa: string }>();

  justificativaDecisao = '';
  erroJustificativa = false;

  get tituloHeader(): string {
    return this.dados.possuiAnexo ? 'Análise da solicitação' : 'Justificativa por formulário';
  }

  get subtituloDireitaHeader(): string {
    return this.dados.possuiAnexo ? 'Pós-análise de IA' : 'Formulário sem imagem';
  }

  get tituloSecaoDecisao(): string {
    return this.perfil === 'PROFESSOR' ? 'Decisão do professor' : 'Decisão da secretaria';
  }

  get corConfianca(): 'alta' | 'media' | 'baixa' {
    const c = this.dados.confiancaIa ?? 0;
    if (c >= 80) return 'alta';
    if (c >= 50) return 'media';
    return 'baixa';
  }

  onVerOriginal(): void {
    this.verOriginal.emit(this.dados);
  }

  onAceitar(): void {
    this.erroJustificativa = false;
    this.aprovar.emit({
      dados: this.dados,
      justificativa: this.justificativaDecisao.trim(),
    });
  }

  onRecusar(): void {
    if (!this.justificativaDecisao.trim()) {
      this.erroJustificativa = true;
      return;
    }
    this.erroJustificativa = false;
    this.recusar.emit({
      dados: this.dados,
      justificativa: this.justificativaDecisao.trim(),
    });
  }
}