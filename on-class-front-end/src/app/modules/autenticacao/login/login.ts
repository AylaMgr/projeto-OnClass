import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

export type PerfilUsuario = 'PROFESSOR' | 'ALUNO_RESPONSAVEL' | 'SECRETARIA';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  perfilSelecionado: PerfilUsuario = 'PROFESSOR';
  ocultarSenha = true;
  senhaFocada = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router
  ) {
    this.loginForm = this.fb.group({
      emailOuUsuario: ['admin@escola.com', [Validators.required]],
      senha: ['123456', [Validators.required, Validators.minLength(6)]]
    });
  }

  selecionarPerfil(perfil: PerfilUsuario, event?: Event): void {
    if (event) {
      event.preventDefault(); // Evita submeter o formulário ao clicar na aba
    }
    this.perfilSelecionado = perfil;
    console.log('Perfil selecionado trocado para:', this.perfilSelecionado);
  }

  alternarVisibilidadeSenha(): void {
    this.ocultarSenha = !this.ocultarSenha;
  }

  onSubmit(): void {
    console.log('--- TENTATIVA DE LOGIN ---');
    console.log('Perfil Atual:', this.perfilSelecionado);
    console.log('Formulário Válido?:', this.loginForm.valid);
    console.log('Erros do Formulário:', this.loginForm.errors || this.loginForm.controls);

    // Se o formulário for inválido, marcamos como tocado mas para teste forçamos a execução
    if (!this.loginForm.valid) {
      console.warn('O formulário está inválido! Verifique os campos.');
      this.loginForm.markAllAsTouched();
    }

    // NAVEGAÇÃO DIRETA BASEADA NO PERFIL
    if (this.perfilSelecionado === 'PROFESSOR') {
      console.log('Navegando para /professor/dashboard...');
      this.router.navigate(['/professor/dashboard']);
    } else if (this.perfilSelecionado === 'SECRETARIA') {
      console.log('Navegando para /secretaria/dashboard...');
      this.router.navigate(['/secretaria/dashboard']);
    } else {
      console.log('Navegando para /aluno/dashboard...');
      this.router.navigate(['/aluno/dashboard']);
    }
  }
}