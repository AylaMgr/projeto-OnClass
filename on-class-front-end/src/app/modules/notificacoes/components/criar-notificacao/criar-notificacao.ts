import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificacoesService } from '../../services/notificacoes';

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
    // Monitora alterações nas datas para aplicar a validação
    this.form.valueChanges.subscribe(() => {
      this.validarDatas();
    });
  }

  validarDatas(): void {
    const inicio = this.form.get('dataInicio')?.value;
    const fim = this.form.get('dataFim')?.value;
    const campoFim = this.form.get('dataFim');

    if (inicio && fim) {
      if (new Date(fim) < new Date(inicio)) {
        // Define o erro diretamente no campo 'dataFim'
        campoFim?.setErrors({ dataInvalida: true });
      } else {
        // Limpa o erro se a data for válida (preservando outros erros se existirem)
        if (campoFim?.hasError('dataInvalida')) {
          campoFim.setErrors(null);
        }
      }
    }
  }

  onSubmit(): void {
    this.validarDatas(); // Valida uma última vez antes de enviar

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.notificacoesService.criar(this.form.value).subscribe({
      next: () => {
        this.sucesso = true;
        this.erro = '';
        this.form.reset();
      },
      error: (err: unknown) => {
        this.erro = 'Erro ao enviar a notificação. Tente novamente.';
        console.error(err);
      }
    });
  }
}