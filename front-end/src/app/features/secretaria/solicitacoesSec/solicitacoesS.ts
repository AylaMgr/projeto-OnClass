import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NotificacoesService } from '../../notificacoes/services/notificacoes.service';
import { TopBarComponent } from '../../../shared/components/top-bar/top-bar.component';
import { CalendarioAbonoComponent } from '../../../shared/components/calendario-abono/calendario-abono.component';
import { AnaliseSolicitacaoCard, } from '../../../shared/components/analise-solicitacao-card/analise-solicitacao-card';
import { MapearParaCardsAnalise } from '../../../shared/components/analise-solicitacao.mapper';

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
  arquivoBase64?: string;
  arquivoNome?: string;
  arquivoTipo?: string;
  pastaAluno?: string;
  parecerIa?: string;
  dataInicio?: string;
  dataFim?: string;
}

@Component({
  selector: 'app-solicitacoes-sec',
  standalone: true,
  imports: [CommonModule, FormsModule, TopBarComponent, CalendarioAbonoComponent, AnaliseSolicitacaoCard],
  templateUrl: './solicitacoesS.html',
  styleUrl: './solicitacoesS.css'
})
export class SolicitacoesSec implements OnInit {
  termoMatricula: string = '';
  solicitacaoId: string = '';
  statusAnalise: StatusAnalise = 'PENDENTE';

  justificativaSecretaria: string = '';
  carregando: boolean = true;
  pdfUrlSegura: SafeResourceUrl | null = null;

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
    private readonly sanitizer: DomSanitizer,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.solicitacaoId = idParam;
      this.carregarSolicitacao(idParam);
    }
  }

  private extrairCampoDescricao(descricao: string, chave: string): string {
    if (!descricao) return '';
    const regex = new RegExp(`${chave}:\\s*([^|]+)`, 'i');
    const match = descricao.match(regex);
    return match ? match[1].trim() : '';
  }

  private formatarDataEnvio(dataRaw: any): string {
    if (!dataRaw) return '-';
    const d = new Date(dataRaw);
    if (isNaN(d.getTime())) return String(dataRaw);
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  private extrairDataIsoDaDescricao(texto: string, indice: number): string | undefined {
    if (!texto) return undefined;
    const isos = texto.match(/\d{4}-\d{2}-\d{2}/g);
    if (isos && isos.length > 0) return isos[indice] || isos[0];
    const brs = texto.match(/(\d{2})\/(\d{2})\/(\d{4})/g);
    if (brs && brs.length > 0) {
      const escolhido = brs[indice] || brs[0];
      const [d, m, a] = escolhido.split('/');
      return `${a}-${m}-${d}`;
    }
    return undefined;
  }

  carregarSolicitacao(id: string): void {
    this.carregando = true;
    this.pdfUrlSegura = null;

    this.notificacoesService.buscarPorId(id).subscribe({
      next: (res: any) => {
        const dados = res?.dados || res;
        if (dados) {
          const descricaoTexto = dados.descricao || dados.observacao || '';
          const base64Bruto = dados.arquivoBase64 || dados.atestado?.arquivoBase64 || '';
          const mimeTipo = dados.arquivoTipo || dados.atestado?.arquivoTipo || (base64Bruto.startsWith('data:application/pdf') ? 'application/pdf' : 'image/jpeg');

          let dataUrlCompleta = dados.imagemUrl || dados.anexo || '';
          if (!dataUrlCompleta && base64Bruto) {
            dataUrlCompleta = base64Bruto.startsWith('data:')
              ? base64Bruto
              : `data:${mimeTipo};base64,${base64Bruto}`;
          }

          const temAnexo = !!dataUrlCompleta;

          if (temAnexo && mimeTipo === 'application/pdf') {
            this.pdfUrlSegura = this.sanitizer.bypassSecurityTrustResourceUrl(dataUrlCompleta);
          }

          const nomePacienteDesc =
            this.extrairCampoDescricao(descricaoTexto, 'Paciente') ||
            this.extrairCampoDescricao(descricaoTexto, 'Nome Lido');

          const caminhoPastaArquivo =
            dados.pastaAluno ||
            dados.atestado?.pastaAluno ||
            this.extrairCampoDescricao(descricaoTexto, 'Arquivo Pasta Aluno');

          const nomeArquivoFinal =
            dados.arquivoNome ||
            dados.atestado?.arquivoNome ||
            (caminhoPastaArquivo ? caminhoPastaArquivo.split('/').pop() : 'atestado_anexado');

          const parecerIaExtraido = this.extrairCampoDescricao(descricaoTexto, 'Parecer IA');

          this.solicitacao = {
            id: dados.id || dados._id || id,
            dataInicio: dados.dataInicio
              ? String(dados.dataInicio).split('T')[0]
              : this.extrairDataIsoDaDescricao(descricaoTexto, 0),
            dataFim: dados.dataFim
              ? String(dados.dataFim).split('T')[0]
              : this.extrairDataIsoDaDescricao(descricaoTexto, 1),
          
            matricula: dados.matricula || dados.alunoMatricula || dados.aluno?.matricula || 'N/I',
            aluno: dados.alunoNome || dados.aluno?.nome || nomePacienteDesc || 'Aluno Não Identificado',
            curso: dados.curso || dados.aluno?.curso || 'Ensino Médio',
            motivo: dados.motivo || dados.titulo || 'Solicitação de Abono',
            descricao: descricaoTexto,
            dataEnvio: this.formatarDataEnvio(dados.createdAt || dados.criadoEm || dados.dataEnvio),
            turno: dados.turno || dados.aluno?.turno || 'Matutino',
            turma: dados.turma || dados.aluno?.turma || dados.aluno?.turmas?.[0] || 'Não informada',
            professor: dados.professor || dados.professorNome || 'Corpo Docente',
            comImagem: temAnexo,
            imagemUrl: temAnexo ? dataUrlCompleta : undefined,
            arquivoBase64: base64Bruto || undefined,
            arquivoNome: nomeArquivoFinal,
            arquivoTipo: mimeTipo,
            pastaAluno: caminhoPastaArquivo || undefined,
            parecerIa: parecerIaExtraido || undefined
          };

          if (dados.status) {
            const s = String(dados.status).toUpperCase();
            if (s === 'ENCAMINHADO_PROFESSOR' || s.includes('APROV')) {
              this.statusAnalise = 'APROVADO';
            } else if (s.includes('REJEIT') || s.includes('RECUS') || s.includes('INDEFER')) {
              this.statusAnalise = 'REJEITADO';
            } else {
              this.statusAnalise = 'PENDENTE';
            }
          }
        }

        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Erro ao carregar detalhes da solicitação:', err);
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  aprovarAtestado(): void {
    this.statusAnalise = 'APROVADO';
    const novoStatus = 'ENCAMINHADO_PROFESSOR';
    this.notificacoesService.atualizarStatus(this.solicitacaoId, novoStatus).subscribe({
      next: () => this.cdr.detectChanges(),
      error: (err: any) => console.error('Erro ao aprovar e encaminhar ao professor:', err)
    });
  }

  rejeitarAtestado(): void {
    this.statusAnalise = 'REJEITADO';
    const novoStatus = 'REJEITADO';
    this.notificacoesService.atualizarStatus(this.solicitacaoId, novoStatus).subscribe({
      next: () => this.cdr.detectChanges(),
      error: (err: any) => console.error('Erro ao rejeitar:', err)
    });
  }

  resetarAnalise(): void {
    this.statusAnalise = 'PENDENTE';
  }

  get dadosCardSecretaria() {
    if (!this.solicitacao) return null;
    return MapearParaCardsAnalise({
      ...this.solicitacao,
      alunoNome: this.solicitacao.aluno,
      alunoMatricula: this.solicitacao.matricula,
      alunoCurso: this.solicitacao.turma,
      arquivoUrl: this.solicitacao.comImagem ? (this.solicitacao.imagemUrl || 'anexo') : undefined,
      possuiAnexo: Boolean(this.solicitacao.comImagem),
    });
  }

  onAprovarCard(evento: { dados: any; justificativa: string }): void {
    this.justificativaSecretaria = evento.justificativa;
    this.aprovarAtestado();
  }

  onRecusarCard(evento: { dados: any; justificativa: string }): void {
    this.justificativaSecretaria = evento.justificativa;
    this.rejeitarAtestado();
  }

  baixarComprovante(tipo: 'APROVADO' | 'REJEITADO'): void {
    let conteudo = '';
    let nomeArquivo = '';

    if (tipo === 'APROVADO') {
      nomeArquivo = `Comprovante_Aprovacao_${this.solicitacao.matricula}.txt`;
      conteudo =
        `========================================\n` +
        `    COMPROVANTE DE VALIDAÇÃO DE ATESTADO\n` +
        `========================================\n\n` +
        `Status: ENCAMINHADO AO PROFESSOR\n` +
        `Aluno: ${this.solicitacao.aluno}\n` +
        `Matrícula: ${this.solicitacao.matricula}\n` +
        `Pasta/Arquivo: ${this.solicitacao.pastaAluno || this.solicitacao.arquivoNome || 'N/I'}\n` +
        `Justificativa: ${this.justificativaSecretaria || 'Validado pela Secretaria'}\n`;
    } else {
      nomeArquivo = `Comprovante_Rejeicao_${this.solicitacao.matricula}.txt`;
      conteudo =
        `========================================\n` +
        `  COMPROVANTE DE NÃO VALIDAÇÃO DE ATESTADO\n` +
        `========================================\n\n` +
        `Status: ATESTADO RECUSADO PELA SECRETARIA\n` +
        `Aluno: ${this.solicitacao.aluno}\n` +
        `Matrícula: ${this.solicitacao.matricula}\n` +
        `Justificativa: ${this.justificativaSecretaria || 'Sem justificativa'}\n`;
    }

    this.executarDownloadTexto(nomeArquivo, conteudo);
  }

  baixarOriginal(): void {
    if (this.solicitacao.imagemUrl) {
      const link = document.createElement('a');
      link.href = this.solicitacao.imagemUrl;
      link.download = this.solicitacao.arquivoNome || `Atestado_${this.solicitacao.matricula}`;
      link.click();
      return;
    }

    const conteudo = `Atestado Médico Original - Aluno: ${this.solicitacao.aluno}\nDetalhes: ${this.solicitacao.descricao || ''}`;
    this.executarDownloadTexto(`Atestado_Original_${this.solicitacao.matricula}.txt`, conteudo);
  }

  private executarDownloadTexto(nomeArquivo: string, conteudo: string): void {
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