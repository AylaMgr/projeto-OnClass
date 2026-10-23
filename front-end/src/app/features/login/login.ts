import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

export type PerfilUsuario = 'PROFESSOR' | 'ALUNO_RESPONSAVEL' | 'SECRETARIA';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  perfilSelecionado: PerfilUsuario = 'PROFESSOR';
  ocultarSenha = true;
  senhaFocada = false;
  mensagemErro = '';

  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  ngOnInit(): void {
    // 1. Inicializa o formulário com os controles zerados e sincronizados com o HTML
    this.loginForm = this.fb.group({
      emailOuUsuario: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.mensagemErro = '';}

  selecionarPerfil(perfil: PerfilUsuario, event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    this.perfilSelecionado = perfil;
    console.log('Perfil selecionado trocado para:', this.perfilSelecionado);
    this.mensagemErro = '';
  }

  alternarVisibilidadeSenha(): void {
    this.ocultarSenha = !this.ocultarSenha;
  }

 onSubmit(): void {
  console.log('>>> Botão ENTRAR clicado!');
  this.mensagemErro = '';


  // 1. Validação de formulário inválido
  if (this.loginForm.invalid) {
    this.loginForm.markAllAsTouched();
    this.mensagemErro = 'Preencha todos os campos corretamente.';
    return;
  }

  const emailOuUsuario = String(this.loginForm.get('emailOuUsuario')?.value || '');
  const senha = String(this.loginForm.get('senha')?.value || '');

  // 2. Validação: e-mail de secretaria usado com perfil de aluno
  const perfilStr = String(this.perfilSelecionado);
  if ((perfilStr === 'ALUNO' || perfilStr === 'ALUNO_RESPONSAVEL') && emailOuUsuario.toLowerCase().includes('secretaria')) {
    this.mensagemErro = 'O perfil selecionado não corresponde a este e-mail.';
    return;
  }

  const payload = {
    email: emailOuUsuario.trim(),
    pass: senha.trim(),
    role: this.perfilSelecionado,
  };

  console.log('--- ENVIANDO REQUISIÇÃO DE LOGIN ---');
  console.log('Dados enviados:', payload);

  this.authService.login(payload).subscribe({
    next: (res) => {
      const userRole = String(res.user?.role || this.authService.getUserRole() || '');
      console.log('Login efetuado com sucesso! Perfil retornado:', userRole);

      if (userRole === 'PROFESSOR') {
        this.router.navigate(['/professor/dashboard']);
      } else if (userRole === 'SECRETARIA') {
        this.router.navigate(['/secretaria/dashboard']);
      } else if (userRole === 'ALUNO' || userRole === 'ALUNO_RESPONSAVEL') {
        this.router.navigate(['/aluno/dashboard']);
      } else {
        this.router.navigate(['/aluno/dashboard']);
      }
    },
    error: (err) => {
      console.error('Erro na autenticação:', err);
      const msg = err.error?.message;
      this.mensagemErro = Array.isArray(msg) ? msg[0] : (msg || 'Credenciais inválidas. Por favor, tente novamente.');
    },
  });
}
}