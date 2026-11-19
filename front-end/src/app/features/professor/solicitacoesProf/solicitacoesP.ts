import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NotificacoesService } from '../../notificacoes/services/notificacoes.service';
import { TopBarComponent } from '../../../shared/components/top-bar/top-bar.component';

export interface SolicitacaoDetalhadaProf {
  id: string;
  matricula: string;
  aluno: string;
  turma?: string;
  turno?: string;
  disciplina?: string;
  motivo: string;
  descricao?: string;
  diasAfastamento?: number;
  diasAtestado?: number;
  faltasAbonar?: string;
  dataEnvio: string;
  comImagem: boolean;
  imagemUrl?: string;
  arquivoBase64?: string | null;
  arquivoNome?: string | null;
  arquivoTipo?: string | null;
  status: string;
}

@Component({
  selector: 'app-solicitacoes-prof',
  standalone: true,
  imports: [CommonModule, FormsModule, TopBarComponent],
  templateUrl: './solicitacoesP.html',
  styleUrls: ['./solicitacoesP.css']
})
export class SolicitacoesProf implements OnInit {
  solicitacaoId: string = '';
  termoMatricula: string = '';
  observacaoProfessor: string = '';
  carregando: boolean = true;
  processando: boolean = false;
  statusDecisao: string | null = null;
  pdfUrlSegura: SafeResourceUrl | null = null;

  solicitacao: SolicitacaoDetalhadaProf = {
    id: '',
    matricula: '',
    aluno: '',
    motivo: '',
    dataEnvio: '',
    status: 'ENCAMINHADO_PROFESSOR',
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

  carregarSolicitacao(id: string): void {
    this.carregando = true;
    this.notificacoesService.buscarPorId(id).subscribe({
      next: (dados: any) => {
        if (dados) {
          const base64 = dados.arquivoBase64 || dados.imagemUrl || dados.anexo || null;
          const tipo = dados.arquivoTipo || (base64?.startsWith('data:application/pdf') ? 'application/pdf' : 'image/png');
          const temAnexo = !!base64;
          const dias = Number(dados.diasAfastamento || dados.diasAtestado || dados.dias || 1);
          const dataBruta = dados.dataEnvio || dados.createdAt || dados.criadoEm;

          this.solicitacao = {
            id: String(dados.id || dados._id || id),
            matricula: String(dados.matricula || dados.alunoMatricula || 'Não informada'),
            aluno: dados.aluno || dados.alunoNome || dados.nomeAluno || 'Aluno não identificado',
            turma: dados.turma || dados.alunoTurma || 'Não informada',
            turno: dados.turno || 'Matutino',
            disciplina: dados.disciplina || 'Todas as disciplinas',
            motivo: dados.motivo || dados.titulo || 'Solicitação de Abono',
            descricao: dados.descricao || dados.justificativa || '',
            diasAfastamento: dias,
            diasAtestado: dias,
            faltasAbonar: dados.faltasAbonar || `${Math.round(dias * 1.5) || 1} Aulas`,
            dataEnvio: dataBruta
              ? new Date(dataBruta).toLocaleDateString('pt-BR')
              : 'Data não informada',
            comImagem: temAnexo,
            imagemUrl: temAnexo ? base64 : undefined,
            arquivoBase64: base64,
            arquivoNome: dados.arquivoNome || 'atestado-anexado',
            arquivoTipo: tipo,
            status: dados.status || 'ENCAMINHADO_PROFESSOR'
          };

          if (base64 && tipo === 'application/pdf') {
            this.pdfUrlSegura = this.sanitizer.bypassSecurityTrustResourceUrl(base64);
          } else {
            this.pdfUrlSegura = null;
          }

          this.termoMatricula = this.solicitacao.matricula;
        }
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Erro ao carregar detalhes para o professor:', err);
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  baixarComprovante(tipoDecisao: string): void {
    alert(`Comprovativo de solicitação ${tipoDecisao} gerado com sucesso!`);
  }

  baixarOriginal(): void {
    const origem = this.solicitacao.arquivoBase64 || this.solicitacao.imagemUrl;
    if (origem) {
      const link = document.createElement('a');
      link.href = origem;
      link.download = this.solicitacao.arquivoNome || 'atestado-aluno';
      link.target = '_blank';
      link.click();
    } else {
      alert('Nenhum anexo encontrado para download nesta solicitação.');
    }
  }

  aceitarAbono(): void {
    this.processando = true;
    this.notificacoesService.atualizarStatus(this.solicitacaoId, 'APROVADO').subscribe({
      next: () => {
        this.solicitacao.status = 'APROVADO';
        this.statusDecisao = 'ACEITO';
        this.processando = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Erro ao aceitar abono:', err);
        this.processando = false;
        this.cdr.detectChanges();
      }
    });
  }

  recusarAbono(): void {
    this.processando = true;
    this.notificacoesService.atualizarStatus(this.solicitacaoId, 'REJEITADO').subscribe({
      next: () => {
        this.solicitacao.status = 'REJEITADO';
        this.statusDecisao = 'RECUSADO';
        this.processando = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Erro ao recusar abono:', err);
        this.processando = false;
        this.cdr.detectChanges();
      }
    });
  }

  reseterDecisao(): void {
    this.statusDecisao = null;
    this.cdr.detectChanges();
  }

  voltarDashboard(): void {
    this.router.navigate(['/professor/dashboard']);
  }
}