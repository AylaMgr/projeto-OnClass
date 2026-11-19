import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminApiService, NovoUsuarioPayload } from '../../../core/services/admin-api.service';

@Component({
  selector: 'app-equipe',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './equipe.html',
  styleUrls: ['./equipe.css']
})
export class EquipeComponent implements OnInit {
  usuarios: any[] = [];
  carregando = true;
  salvando = false;

  nomeInstituicao = 'Colégio Santo Américo';
  dominioInstituicao = 'onclass.edu.br';
  ambienteSelecionado = 'Santo Américo';

  abaAtiva: 'TODOS' | 'PROFESSOR' | 'SECRETARIA' = 'TODOS';
  termoBusca = '';
  filtroStatus: 'TODOS' | 'ATIVO' | 'CONVIDADO' | 'INATIVO' = 'TODOS';
  paginaAtual = 1;
  itensPorPagina = 6;

  disciplinasDisponiveis = [
    'Matemática',
    'Português',
    'História',
    'Geografia',
    'Ciências / Biologia',
    'Física',
    'Química',
    'Inglês',
    'Educação Física'
  ];

  turmasDisponiveis = [
    '1º Ano A - Manhã',
    '1º Ano B - Tarde',
    '2º Ano A - Manhã',
    '2º Ano B - Tarde',
    '3º Ano A - Manhã',
    '3º Ano B - Tarde',
    '9º Ano A - Manhã',
    '9º Ano B - Tarde'
  ];

  disciplinaSelecionada = '';
  turmasSelecionadas: string[] = [];

  permissoes = {
    visualizarAlunos: true,
    consultarJustificativas: true,
    revisarAprovar: false
  };

  enviarConviteEmail = true;

  novoUsuario: NovoUsuarioPayload = {
    nome: '',
    email: '',
    dataNascimento: '123456',
    role: 'PROFESSOR',
    matricula: '',
    turmas: [],
    senha: '123456'
  };

  constructor(
    private adminApi: AdminApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarTemaInstituicao();
    this.gerarCredenciaisAutomaticas();
    this.carregarUsuarios();
  }

  carregarTemaInstituicao(): void {
    this.adminApi.obterTema().subscribe({
      next: (tema: any) => {
        if (tema?.nomeInstituicao || tema?.nomeExibido) {
          this.nomeInstituicao = tema.nomeInstituicao || tema.nomeExibido;
          this.ambienteSelecionado = this.nomeInstituicao.replace(/^Colégio\s+/i, '');
        }
        if (tema?.dominio) {
          this.dominioInstituicao = tema.dominio.replace(/^app\./i, '');
        }
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  carregarUsuarios(): void {
    this.carregando = true;
    this.adminApi.obterUsuarios().subscribe({
      next: (res) => {
        const lista = Array.isArray(res) ? res : [];
        this.usuarios = lista.filter(
          (u) => u.role === 'PROFESSOR' || u.role === 'SECRETARIA'
        );
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar equipe:', err);
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  selecionarPapel(role: 'PROFESSOR' | 'SECRETARIA'): void {
    this.novoUsuario.role = role;
    if (role === 'SECRETARIA') {
      // Secretário não possui disciplina nem turmas vinculadas
      this.disciplinaSelecionada = '';
      this.turmasSelecionadas = [];
      this.permissoes = {
        visualizarAlunos: true,
        consultarJustificativas: true,
        revisarAprovar: true
      };
    } else {
      this.permissoes = {
        visualizarAlunos: true,
        consultarJustificativas: true,
        revisarAprovar: false
      };
    }
    this.gerarCredenciaisAutomaticas();
  }

  toggleTurma(turma: string): void {
    const idx = this.turmasSelecionadas.indexOf(turma);
    if (idx >= 0) {
      this.turmasSelecionadas.splice(idx, 1);
    } else {
      this.turmasSelecionadas.push(turma);
    }
  }

  turmaEstaSelecionada(turma: string): boolean {
    return this.turmasSelecionadas.includes(turma);
  }

  aoAlterarNome(): void {
    const partes = this.novoUsuario.nome
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z\s]/g, '')
      .split(/\s+/)
      .filter(Boolean);

    if (partes.length >= 2) {
      this.novoUsuario.email = `${partes[0]}.${partes[partes.length - 1]}@${this.dominioInstituicao}`;
    } else if (partes.length === 1) {
      this.novoUsuario.email = `${partes[0]}@${this.dominioInstituicao}`;
    }

    this.gerarCredenciaisAutomaticas();
  }

  gerarCredenciaisAutomaticas(): void {
    const prefixo = this.novoUsuario.role === 'PROFESSOR' ? 'PROF' : 'SEC';
    const sufixo = Math.floor(10000 + Math.random() * 90000);
    if (!this.novoUsuario.matricula || /^(PROF|SEC)\d+$/.test(this.novoUsuario.matricula)) {
      this.novoUsuario.matricula = `${prefixo}${sufixo}`;
    }
    if (!this.novoUsuario.senha) {
      this.novoUsuario.senha = '123456';
    }
  }

  cadastrarUsuario(): void {
    if (!this.novoUsuario.nome.trim() || !this.novoUsuario.email.trim()) {
      alert('Preencha os campos obrigatórios: Nome completo e E-mail institucional.');
      return;
    }

    this.salvando = true;

    let vinculos: string[] = [];
    if (this.novoUsuario.role === 'PROFESSOR') {
      if (this.disciplinaSelecionada) {
        vinculos.push(this.disciplinaSelecionada);
      }
      vinculos = [...vinculos, ...this.turmasSelecionadas];
    }

    const payload: NovoUsuarioPayload = {
      nome: this.novoUsuario.nome.trim(),
      email: this.novoUsuario.email.trim().toLowerCase(),
      dataNascimento: this.novoUsuario.senha || '123456',
      senha: this.novoUsuario.senha || '123456',
      role: this.novoUsuario.role,
      matricula: this.novoUsuario.matricula,
      turmas: vinculos
    };

    this.adminApi.cadastrarUsuario(payload).subscribe({
      next: () => {
        const papelTexto = this.novoUsuario.role === 'PROFESSOR' ? 'Professor(a)' : 'Secretário(a)';
        alert(`${papelTexto} cadastrado(a) com sucesso!\nSenha de acesso: ${payload.senha}`);
        this.novoUsuario = {
          nome: '',
          email: '',
          dataNascimento: '123456',
          role: this.novoUsuario.role,
          matricula: '',
          turmas: [],
          senha: '123456'
        };
        this.disciplinaSelecionada = '';
        this.turmasSelecionadas = [];
        this.salvando = false;
        this.gerarCredenciaisAutomaticas();
        this.carregarUsuarios();
      },
      error: (err) => {
        console.error('Erro ao cadastrar membro da equipe:', err);
        const msgBackend = err?.error?.message;
        const detalhe = Array.isArray(msgBackend)
          ? msgBackend.join('\n')
          : msgBackend || 'Verifique se o e-mail já está cadastrado ou reinicie o back-end.';
        alert(`Erro ao cadastrar usuário:\n${detalhe}`);
        this.salvando = false;
        this.cdr.detectChanges();
      }
    });
  }

  exportarEquipeCSV(): void {
    const linhas = [
      ['Matricula', 'Nome', 'Email', 'Papel', 'Turmas/Vinculo'].join(';'),
      ...this.usuarios.map((u) =>
        [
          u.matricula || 'N/I',
          `"${u.nome || ''}"`,
          u.email || '',
          u.role || '',
          `"${(u.turmas || []).join(', ')}"`
        ].join(';')
      )
    ];
    const blob = new Blob([linhas.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `equipe_onclass_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  alternarFiltroStatus(): void {
    const ordem: Array<'TODOS' | 'ATIVO' | 'CONVIDADO' | 'INATIVO'> = [
      'TODOS',
      'ATIVO',
      'CONVIDADO',
      'INATIVO'
    ];
    const idx = ordem.indexOf(this.filtroStatus);
    this.filtroStatus = ordem[(idx + 1) % ordem.length];
    this.paginaAtual = 1;
  }

  obterIniciais(nome: string): string {
    if (!nome) return 'US';
    const partes = nome.trim().replace(/^Prof\.\s*/i, '').split(/\s+/);
    if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }

  obterStatusUsuario(u: any): 'Ativo' | 'Convidado' | 'Inativo' {
    if (u.ativo === false || u.status === 'INATIVO') return 'Inativo';
    if (u.status === 'CONVIDADO') return 'Convidado';
    return 'Ativo';
  }

  obterSubtextoAcesso(u: any): string {
    const st = this.obterStatusUsuario(u);
    if (st === 'Convidado') return 'Aguardando';
    if (u.updatedAt || u.createdAt) {
      const d = new Date(u.updatedAt || u.createdAt);
      if (!isNaN(d.getTime())) {
        return `Hoje, ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
      }
    }
    return 'Hoje, 09:36';
  }

  obterPapelLabel(u: any): string {
    return u.role === 'SECRETARIA' ? 'Secretária' : 'Professor';
  }

  obterVinculoLabel(u: any): string {
    if (u.role === 'SECRETARIA') {
      return 'Secretaria • Unidade principal';
    }
    if (u.turmas && u.turmas.length > 0) {
      return u.turmas.join(' • ');
    }
    return 'Docente • Sem turmas vinculadas';
  }

  get totalProfessores(): number {
    return this.usuarios.filter((u) => u.role === 'PROFESSOR').length;
  }

  get professoresAtivos(): number {
    return this.usuarios.filter(
      (u) => u.role === 'PROFESSOR' && this.obterStatusUsuario(u) === 'Ativo'
    ).length;
  }

  get professoresInativos(): number {
    return this.totalProfessores - this.professoresAtivos;
  }

  get totalSecretarios(): number {
    return this.usuarios.filter((u) => u.role === 'SECRETARIA').length;
  }

  get convitesPendentes(): number {
    return this.usuarios.filter((u) => this.obterStatusUsuario(u) === 'Convidado').length;
  }

  get limiteLicencas(): number {
    return Math.max(60, this.usuarios.length + 21);
  }

  get licencasDisponiveis(): number {
    return Math.max(0, this.limiteLicencas - this.usuarios.length);
  }

  get usuariosFiltrados(): any[] {
    const termo = this.termoBusca.trim().toLowerCase();
    return this.usuarios.filter((u) => {
      const bateAba = this.abaAtiva === 'TODOS' || u.role === this.abaAtiva;
      const st = this.obterStatusUsuario(u).toUpperCase();
      const bateStatus = this.filtroStatus === 'TODOS' || st === this.filtroStatus;
      const bateBusca =
        !termo ||
        String(u.nome || '').toLowerCase().includes(termo) ||
        String(u.email || '').toLowerCase().includes(termo) ||
        String(u.matricula || '').toLowerCase().includes(termo);
      return bateAba && bateStatus && bateBusca;
    });
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.usuariosFiltrados.length / this.itensPorPagina));
  }

  get usuariosPaginados(): any[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return this.usuariosFiltrados.slice(inicio, inicio + this.itensPorPagina);
  }

  get inicioExibicao(): number {
    if (this.usuariosFiltrados.length === 0) return 0;
    return (this.paginaAtual - 1) * this.itensPorPagina + 1;
  }

  get fimExibicao(): number {
    return Math.min(this.paginaAtual * this.itensPorPagina, this.usuariosFiltrados.length);
  }

  mudarAba(aba: 'TODOS' | 'PROFESSOR' | 'SECRETARIA'): void {
    this.abaAtiva = aba;
    this.paginaAtual = 1;
  }

  irParaPagina(p: number): void {
    if (p >= 1 && p <= this.totalPaginas) {
      this.paginaAtual = p;
    }
  }
}