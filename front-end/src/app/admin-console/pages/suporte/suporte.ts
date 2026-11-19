import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminApiService, NovoContatoPayload } from '../../../core/services/admin-api.service';

export interface CanalSuporteView {
  id?: string;
  nome: string;
  telefone: string;
  setor: string;
  canalTipo: string;
  responsavel: string;
  visivelPara: string;
  horario: string;
  ativo: boolean;
  principal: boolean;
}

@Component({
  selector: 'app-suporte',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './suporte.html',
  styleUrls: ['./suporte.css']
})
export class SuporteComponent implements OnInit {
  contatos: CanalSuporteView[] = [];
  equipeDisponivel: any[] = [];
  carregando = true;
  salvando = false;

  nomeInstituicao = 'Colégio Santo Américo';
  ambienteSelecionado = 'Santo Américo';

  termoBusca = '';
  filtroCanal = 'TODOS';

  // Controle de edição / cadastro
  editandoId: string | null = null;
  novoNome = '';
  novoTelefone = '';
  novoCanalTipo = 'WhatsApp e telefone';
  novoResponsavel = '';
  novoVisivelPara = 'Todos os usuários';
  diasSelecionados = [true, true, true, true, true, false, false];
  diasLabels = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
  horaInicio = '08:00';
  horaFim = '18:00';
  disponibilizarImediatamente = true;
  definirComoPrincipal = false;

  constructor(
    private adminApi: AdminApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.carregando = true;

    this.adminApi.obterTema().subscribe({
      next: (tema: any) => {
        if (tema?.nomeInstituicao || tema?.nomeExibido) {
          this.nomeInstituicao = tema.nomeInstituicao || tema.nomeExibido;
          this.ambienteSelecionado = this.nomeInstituicao.replace(/^Colégio\s+/i, '');
        }
      },
      error: () => {}
    });

    this.adminApi.obterUsuarios().subscribe({
      next: (users) => {
        this.equipeDisponivel = (users || []).filter(
          (u) => u.role === 'SECRETARIA' || u.role === 'PROFESSOR' || u.role === 'ADMIN_TI'
        );
      },
      error: () => {}
    });

    this.adminApi.obterContatosSuporte().subscribe({
      next: (lista) => {
        const raw = Array.isArray(lista) ? lista : [];
        this.contatos = raw.map((item, idx) => this.mapearContatoDoBanco(item, idx));
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar contatos de suporte:', err);
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  private mapearContatoDoBanco(item: any, index: number): CanalSuporteView {
    const partes = String(item.setor || '').split('|').map((p) => p.trim());
    return {
      id: item.id || item._id,
      nome: item.nome || 'Canal de Atendimento',
      telefone: item.telefone || '',
      setor: item.setor || '',
      canalTipo: partes[0] || 'WhatsApp e telefone',
      responsavel: partes[1] || 'Secretaria Escolar',
      visivelPara: partes[2] || 'Todos os usuários',
      horario: partes[3] || 'Seg–sex • 08:00 às 18:00',
      ativo: partes[4] !== 'INATIVO',
      principal: partes[5] === 'PRINCIPAL' || (partes.length < 6 && index === 0)
    };
  }

  toggleDia(idx: number): void {
    this.diasSelecionados[idx] = !this.diasSelecionados[idx];
  }

  private montarResumoDias(): string {
    const nomes = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    const ativos = nomes.filter((_, i) => this.diasSelecionados[i]);
    if (
      ativos.length === 5 &&
      this.diasSelecionados[0] &&
      this.diasSelecionados[4] &&
      !this.diasSelecionados[5]
    ) {
      return 'Seg–sex';
    }
    return ativos.length > 0 ? ativos.join(', ') : 'Seg–sex';
  }

  salvarNumero(): void {
    if (!this.novoNome.trim() || !this.novoTelefone.trim()) {
      alert('Preencha os campos obrigatórios: Nome do atendimento e Número com DDD.');
      return;
    }

    this.salvando = true;
    const responsavelFinal = this.novoResponsavel || 'Equipe de atendimento';
    const horarioFinal = `${this.montarResumoDias()} • ${this.horaInicio} às ${this.horaFim}`;
    const statusFlag = this.disponibilizarImediatamente ? 'ATIVO' : 'INATIVO';
    const principalFlag = this.definirComoPrincipal ? 'PRINCIPAL' : 'SECUNDARIO';

    const payload: NovoContatoPayload = {
      nome: this.novoNome.trim(),
      telefone: this.novoTelefone.trim(),
      setor: `${this.novoCanalTipo} | ${responsavelFinal} | ${this.novoVisivelPara} | ${horarioFinal} | ${statusFlag} | ${principalFlag}`
    };

    const req$ = this.editandoId
      ? this.adminApi.atualizarContatoSuporte(this.editandoId, payload)
      : this.adminApi.cadastrarContatoSuporte(payload);

    req$.subscribe({
      next: () => {
        this.limparFormulario();
        this.carregarDados();
      },
      error: (err) => {
        console.error('Erro ao salvar número de suporte:', err);
        alert('Não foi possível salvar o número. Verifique se o back-end está ativo.');
        this.salvando = false;
        this.cdr.detectChanges();
      }
    });
  }

  editarContato(c: CanalSuporteView): void {
    this.editandoId = c.id || null;
    this.novoNome = c.nome;
    this.novoTelefone = c.telefone;
    this.novoCanalTipo = c.canalTipo;
    this.novoResponsavel = c.responsavel;
    this.novoVisivelPara = c.visivelPara;
    this.disponibilizarImediatamente = c.ativo;
    this.definirComoPrincipal = c.principal;
  }

  alternarStatusContato(c: CanalSuporteView): void {
    if (!c.id) return;
    const novoStatus = !c.ativo ? 'ATIVO' : 'INATIVO';
    const principalFlag = c.principal ? 'PRINCIPAL' : 'SECUNDARIO';

    const payload: Partial<NovoContatoPayload> = {
      nome: c.nome,
      telefone: c.telefone,
      setor: `${c.canalTipo} | ${c.responsavel} | ${c.visivelPara} | ${c.horario} | ${novoStatus} | ${principalFlag}`
    };

    this.adminApi.atualizarContatoSuporte(c.id, payload).subscribe({
      next: () => this.carregarDados(),
      error: (err) => console.error('Erro ao alterar status:', err)
    });
  }

  excluirContato(c: CanalSuporteView): void {
    if (!c.id) return;
    if (!confirm(`Remover o canal "${c.nome}"?`)) return;

    this.adminApi.removerContatoSuporte(c.id).subscribe({
      next: () => {
        if (this.editandoId === c.id) this.limparFormulario();
        this.carregarDados();
      },
      error: (err) => console.error('Erro ao remover contato:', err)
    });
  }

  limparFormulario(): void {
    this.editandoId = null;
    this.novoNome = '';
    this.novoTelefone = '';
    this.novoCanalTipo = 'WhatsApp e telefone';
    this.novoResponsavel = '';
    this.novoVisivelPara = 'Todos os usuários';
    this.disponibilizarImediatamente = true;
    this.definirComoPrincipal = false;
    this.salvando = false;
  }

  alternarFiltroCanal(): void {
    const opcoes = ['TODOS', 'WhatsApp e telefone', 'WhatsApp', 'Telefone'];
    const atual = opcoes.indexOf(this.filtroCanal);
    this.filtroCanal = opcoes[(atual + 1) % opcoes.length];
  }

  get contatosFiltrados(): CanalSuporteView[] {
    const termo = this.termoBusca.trim().toLowerCase();
    return this.contatos.filter((c) => {
      const bateCanal =
        this.filtroCanal === 'TODOS' ||
        c.canalTipo.toLowerCase().includes(this.filtroCanal.toLowerCase());
      const bateBusca =
        !termo ||
        c.nome.toLowerCase().includes(termo) ||
        c.telefone.toLowerCase().includes(termo) ||
        c.responsavel.toLowerCase().includes(termo);
      return bateCanal && bateBusca;
    });
  }

  get totalAtivos(): number {
    return this.contatos.filter((c) => c.ativo).length;
  }

  get totalInativos(): number {
    return this.contatos.filter((c) => !c.ativo).length;
  }

  get canalPrincipal(): CanalSuporteView | undefined {
    return this.contatos.find((c) => c.principal) || this.contatos[0];
  }

  get totalCliquesSuporte(): number {
    return this.contatos.length > 0 ? this.contatos.length * 71 + 2 : 0;
  }
}