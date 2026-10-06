import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificacoesService } from '../../notificacoes/services/notificacoes.service';

export interface SolicitacaoDetalhadaProf {
  id: string;
  matricula: string;
  aluno: string;
  turma?: string;
  turno?: string;
  disciplina?: string;
  motivo: string;
  diasAfastamento?: number;
  diasAtestado?: number;
  faltasAbonar?: string;
  dataEnvio: string;
  comImagem: boolean;
  imagemUrl?: string;
  status: string;
}

@Component({
  selector: 'app-solicitacoes-prof',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitacoesP.html',
  styleUrl: './solicitacoesP.css'
})
export class SolicitacoesProf implements OnInit {
  solicitacaoId: string = '1';
  termoMatricula: string = '';
  observacaoProfessor: string = '';
  carregando: boolean = true;
  processando: boolean = false;
  statusDecisao: string | null = null;

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
          const temImagem = !!(dados.imagemUrl || dados.anexo || dados.comImagem);
          const dias = dados.diasAfastamento || dados.diasAtestado || dados.dias || 3;
          
          this.solicitacao = {
            id: dados.id || id,
            matricula: dados.matricula || dados.alunoMatricula || '2024001234',
            aluno: dados.aluno || dados.alunoNome || 'Mariana Souza Santos',
            turma: dados.turma || '8º Ano A',
            turno: dados.turno || 'Matutino',
            disciplina: dados.disciplina || 'História',
            motivo: dados.motivo || dados.titulo || 'Solicitação de Abono: Atestado Médico',
            diasAfastamento: dias,
            diasAtestado: dias,
            faltasAbonar: dados.faltasAbonar || `${Math.round(dias * 1.5) || 4} Aulas`,
            dataEnvio: dados.dataEnvio
              ? new Date(dados.dataEnvio).toLocaleDateString('pt-BR')
              : '12/08/2026',
            comImagem: temImagem,
            imagemUrl: temImagem ? (dados.imagemUrl || dados.anexo) : undefined,
            status: dados.status || 'ENCAMINHADO_PROFESSOR'
          };
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
    console.log(`A descarregar comprovativo de decisão (${tipoDecisao}) para a solicitação:`, this.solicitacaoId);
    alert(`Comprovativo de solicitação ${tipoDecisao} gerado com sucesso!`);
  }

  baixarOriginal(): void {
    if (this.solicitacao.imagemUrl) {
      window.open(this.solicitacao.imagemUrl, '_blank');
    } else {
      alert('Anexo não encontrado para download.');
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

  resetarDecisao(): void {
    this.statusDecisao = null;
    this.cdr.detectChanges();
  }

  voltarDashboard(): void {
    this.router.navigate(['/professor/dashboard']);
  }
}