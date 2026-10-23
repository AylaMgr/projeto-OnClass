import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificacoesService } from '../notificacoes/services/notificacoes.service';

interface DiaCalendario {
  data: Date;
  diaNumero: number;
  outromes: boolean;
  hoje: boolean;
  selecionado: boolean;
}

@Component({
  selector: 'app-criar-notificacao',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './criar-notificacao.html',
  styleUrl: './criar-notificacao.css',
  encapsulation: ViewEncapsulation.None
})
export class CriarNotificacao implements OnInit {
  form: FormGroup;
  sucesso: boolean = false;
  erro: string = '';

  // Dropdown de Motivos
  menuMotivoAberto: boolean = false;
  opcoesMotivo: string[] = [
    'Sintomas Gripais',
    'Tratamento Odontológico',
    'Consulta Médica / Exames',
    'Outros Motivos'
  ];

  // Calendário Customizado
  campoDataAberto: 'inicio' | 'fim' | null = null;
  dataAtualVisivel: Date = new Date();
  diasSemana: string[] = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  diasCalendario: DiaCalendario[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly notificacoesService: NotificacoesService
  ) {
    this.form = this.fb.group({
      motivo: ['', Validators.required],
      dataInicio: ['', Validators.required],
      dataFim: ['', Validators.required],
      descricao: ['', [Validators.required, Validators.minLength(10)]],
      declaracaoVeracidade: [false, Validators.requiredTrue]
    });
  }

  ngOnInit(): void {
    this.gerarCalendario();
    this.form.valueChanges.subscribe(() => {
      this.validarDatas();
    });
  }

  // --- Motivos Dropdown ---
  alternarMenuMotivo(): void {
    this.menuMotivoAberto = !this.menuMotivoAberto;
    this.campoDataAberto = null;
  }

  selecionarMotivo(opcao: string): void {
    this.form.get('motivo')?.setValue(opcao);
    this.form.get('motivo')?.markAsTouched();
    this.menuMotivoAberto = false;
  }

  // --- Calendário Customizado ---
  abrirCalendario(campo: 'inicio' | 'fim'): void {
    if (this.campoDataAberto === campo) {
      this.campoDataAberto = null;
    } else {
      this.campoDataAberto = campo;
      this.menuMotivoAberto = false;
      const valorAtual = this.form.get(campo === 'inicio' ? 'dataInicio' : 'dataFim')?.value;
      if (valorAtual) {
        const [ano, mes, dia] = valorAtual.split('-');
        this.dataAtualVisivel = new Date(Number(ano), Number(mes) - 1, Number(dia));
      } else {
        this.dataAtualVisivel = new Date();
      }
      this.gerarCalendario();
    }
  }

  mudarMes(delta: number): void {
    this.dataAtualVisivel = new Date(
      this.dataAtualVisivel.getFullYear(),
      this.dataAtualVisivel.getMonth() + delta,
      1
    );
    this.gerarCalendario();
  }

  gerarCalendario(): void {
    const ano = this.dataAtualVisivel.getFullYear();
    const mes = this.dataAtualVisivel.getMonth();
    
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const diaInicioSemana = primeiroDia.getDay();
    
    const hoje = new Date();
    const campoControle = this.campoDataAberto === 'inicio' ? 'dataInicio' : 'dataFim';
    const dataSelecionadaStr = this.form.get(campoControle)?.value;

    const dias: DiaCalendario[] = [];

    // Dias do mês anterior
    const mesAnteriorUltimoDia = new Date(ano, mes, 0).getDate();
    for (let i = diaInicioSemana - 1; i >= 0; i--) {
      const d = new Date(ano, mes - 1, mesAnteriorUltimoDia - i);
      dias.push({
        data: d,
        diaNumero: d.getDate(),
        outromes: true,
        hoje: false,
        selecionado: false
      });
    }

    // Dias do mês atual
    for (let i = 1; i <= ultimoDia.getDate(); i++) {
      const d = new Date(ano, mes, i);
      const isHoje = d.toDateString() === hoje.toDateString();
      
      let isSelecionado = false;
      if (dataSelecionadaStr) {
        const [sAno, sMes, sDia] = dataSelecionadaStr.split('-');
        isSelecionado = (d.getFullYear() === Number(sAno) && d.getMonth() === Number(sMes) - 1 && d.getDate() === Number(sDia));
      }

      dias.push({
        data: d,
        diaNumero: i,
        outromes: false,
        hoje: isHoje,
        selecionado: isSelecionado
      });
    }

    // Dias do próximo mês para fechar a grade (42 slots para 6 semanas)
    const restante = 42 - dias.length;
    for (let i = 1; i <= restante; i++) {
      const d = new Date(ano, mes + 1, i);
      dias.push({
        data: d,
        diaNumero: i,
        outromes: true,
        hoje: false,
        selecionado: false
      });
    }

    this.diasCalendario = dias;
  }

  selecionarDia(item: DiaCalendario): void {
    const ano = item.data.getFullYear();
    const mes = String(item.data.getMonth() + 1).padStart(2, '0');
    const dia = String(item.data.getDate()).padStart(2, '0');
    const isoDate = `${ano}-${mes}-${dia}`;

    if (this.campoDataAberto === 'inicio') {
      this.form.get('dataInicio')?.setValue(isoDate);
      this.form.get('dataInicio')?.markAsTouched();
    } else if (this.campoDataAberto === 'fim') {
      this.form.get('dataFim')?.setValue(isoDate);
      this.form.get('dataFim')?.markAsTouched();
    }

    this.campoDataAberto = null;
  }

  formatarDataExibicao(valorISO: string): string {
    if (!valorISO) return 'Selecione a data';
    const [ano, mes, dia] = valorISO.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  get nomeMesAnoAtual(): string {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${meses[this.dataAtualVisivel.getMonth()]} de ${this.dataAtualVisivel.getFullYear()}`;
  }

  validarDatas(): void {
    const inicio = this.form.get('dataInicio')?.value;
    const fim = this.form.get('dataFim')?.value;
    const campoFim = this.form.get('dataFim');

    if (inicio && fim) {
      if (new Date(fim) < new Date(inicio)) {
        campoFim?.setErrors({ dataInvalida: true });
      } else {
        if (campoFim?.hasError('dataInvalida')) {
          campoFim.setErrors(null);
        }
      }
    }
  }

onSubmit(): void {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  const rawValues = this.form.value;

  // Função para converter com segurança qualquer tipo de entrada (timestamp string, numero ou ISO)
  const formatarDataEnvio = (data: any): string => {
    if (!data) return new Date().toISOString();
    
    // Se for string numérica (ex: "1791244800000") ou número primitivo
    const num = Number(data);
    if (!isNaN(num) && num > 0) {
      return new Date(num).toISOString();
    }

    const parsedDate = new Date(data);
    return !isNaN(parsedDate.getTime()) ? parsedDate.toISOString() : new Date().toISOString();
  };

  const payload = {
    ...rawValues,
    dataInicio: formatarDataEnvio(rawValues.dataInicio),
    dataFim: formatarDataEnvio(rawValues.dataFim),
    administrador: 'Secretaria',
  };

  console.log('Payload enviado para a API:', payload);

  this.notificacoesService.criar(payload).subscribe({
    next: (res: any) => {
      console.log('Notificação enviada com sucesso!', res);
      this.sucesso = true;
      this.erro = '';
      this.form.reset();
      this.notificacoesService.notificarMudanca();
    },
    error: (err: any) => {
      console.error('Erro ao enviar:', err);
      this.erro = 'Erro ao enviar a notificação. Tente novamente.';
      this.sucesso = false;
    }
  });
}
}