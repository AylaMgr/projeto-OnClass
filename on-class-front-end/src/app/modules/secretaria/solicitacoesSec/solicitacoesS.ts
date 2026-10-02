import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

export interface ItemAnaliseIA {
  rotulo: string;
  status: boolean; // true = Ok (verde), false = Erro/Alerta (vermelho)
  detalhe: string;
}

export interface DetalheSolicitacao {
  id: string;
  matricula: string;
  aluno: string;
  curso: string;
  tipoDocumento: string;
  tamanhoArquivo: string;
  conteudoAtestado: {
    clinica: string;
    texto: string;
    localData: string;
    carimbo: string;
  };
  confiancaIA: number;
  statusIA: string;
  analiseIA: ItemAnaliseIA[];
  observacaoIA: string;
}

@Component({
  selector: 'app-solicitacoes-s',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitacoesS.html',
  styleUrl: './solicitacoesS.css'
})
export class SolicitacoesSec implements OnInit {

  solicitacaoId: string | null = null;
  solicitacao!: DetalheSolicitacao;
  justificativaSecretaria: string = '';
  zoomNivel: number = 100;

  // Base de dados simulada para os detalhes
  private readonly dadosSolicitacoes: Record<string, DetalheSolicitacao> = {
    '1': {
      id: '1',
      matricula: '2024005678',
      aluno: 'Maria Silva',
      curso: 'Enfermagem',
      tipoDocumento: 'PDF / Imagem',
      tamanhoArquivo: '3.2 MB',
      conteudoAtestado: {
        clinica: 'CLÍNICA MÉDICA VIDA & SAÚDE',
        texto: 'Atesto para os devidos fins que a paciente Maria Silva, portadora do CPF 123.456.789-00, esteve sob meus cuidados médicos no dia 12 de Agosto de 2026, necessitando de 03 (três) dias de repouso absoluto por motivos de saúde (CID10: J11).',
        localData: 'Brasília - DF, 12/08/2026.',
        carimbo: '[Carimbo com CRM ilegível]\nDr. [Não Identificado]'
      },
      confiancaIA: 35,
      statusIA: 'Rejeitado pela IA',
      analiseIA: [
        { rotulo: 'Assinatura Médica', status: false, detalhe: 'Não detectada ou ilegível' },
        { rotulo: 'Número CRM', status: false, detalhe: 'Ausente no cabeçalho/corpo' },
        { rotulo: 'Data do Atestado', status: true, detalhe: 'Identificado (12/08/2026)' },
        { rotulo: 'Carimbo do Médico', status: false, detalhe: 'Não identificado' },
        { rotulo: 'Nome do Paciente', status: true, detalhe: 'Compatível (Maria Silva)' }
      ],
      observacaoIA: 'Documento com baixa qualidade de imagem. Possível foto de tela ou fotocópia de baixa resolução. Recomenda-se solicitar reenvio ou cópia digitalizada limpa caso necessário.'
    }
  };

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.solicitacaoId = this.route.snapshot.paramMap.get('id');

    // Se houver ID correspondente na base simulada, carrega ele, senão usa o padrão (ID '1')
    if (this.solicitacaoId && this.dadosSolicitacoes[this.solicitacaoId]) {
      this.solicitacao = this.dadosSolicitacoes[this.solicitacaoId];
    } else {
      this.solicitacao = this.dadosSolicitacoes['1'];
    }
  }

  voltar(): void {
    this.router.navigate(['/secretaria/analises-manuais']);
  }

  aumentarZoom(): void {
    if (this.zoomNivel < 150) this.zoomNivel += 10;
  }

  diminuirZoom(): void {
    if (this.zoomNivel > 70) this.zoomNivel -= 10;
  }

  resetarZoom(): void {
    this.zoomNivel = 100;
  }

  baixarOriginal(): void {
    alert(`Iniciando o download do arquivo de ${this.solicitacao.aluno}...`);
  }

  aprovarAtestado(): void {
    alert(`Atestado de ${this.solicitacao.aluno} APROVADO com sucesso!`);
    this.voltar();
  }

  rejeitarAtestado(): void {
    if (!this.justificativaSecretaria.trim()) {
      alert('Por favor, digite a justificativa da secretaria antes de rejeitar.');
      return;
    }
    alert(`Atestado de ${this.solicitacao.aluno} REJEITADO.`);
    this.voltar();
  }
}