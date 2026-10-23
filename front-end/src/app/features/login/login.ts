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

    this.mensagemErro = '';
  }

  selecionarPerfil(perfil: PerfilUsuario, event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    this.perfilSelecionado = perfil;
    console.log('Perfil selecionado trocado para:', this.perfilSelecionado);
  }

  alternarVisibilidadeSenha(): void {
    this.ocultarSenha = !this.ocultarSenha;
  }

  onSubmit(): void {
    this.mensagemErro = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { emailOuUsuario, senha } = this.loginForm.value;

    const payload = {
      email: String(emailOuUsuario).trim(),
      pass: String(senha).trim(),
      role: this.perfilSelecionado,
    };

    console.log('--- ENVIANDO REQUISIÇÃO DE LOGIN ---');
    console.log('Dados enviados:', payload);

    this.authService.login(payload).subscribe({
      next: (res) => {
        const userRole = res.user?.role || this.authService.getUserRole();
        console.log('Login efetuado com sucesso! Perfil retornado:', userRole);

        if (userRole === 'PROFESSOR') {
          this.router.navigate(['/professor/dashboard']);
        } else if (userRole === 'SECRETARIA') {
          this.router.navigate(['/secretaria/dashboard']);
        } else if (userRole === 'ALUNO' || userRole === 'ALUNO_RESPONSAVEL') {
          this.router.navigate(['/aluno/dashboard']);
        }
      },
      error: (err) => {
        console.error('Erro na autenticação:', err);
        this.mensagemErro = err.error?.message || 'Credenciais inválidas. Por favor, tente novamente.';
      },
    });
  }
}