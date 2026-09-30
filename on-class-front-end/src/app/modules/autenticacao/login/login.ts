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
  perfilSelecionado: PerfilUsuario = 'SECRETARIA';
  ocultarSenha = true;
  senhaFocada = false;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      emailOuUsuario: ['', [Validators.required]],
      senha: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  selecionarPerfil(perfil: PerfilUsuario): void {
    this.perfilSelecionado = perfil;
  }

  alternarVisibilidadeSenha(): void {
    this.ocultarSenha = !this.ocultarSenha;
  }

  onSubmit(): void {
  if (this.loginForm.valid) {
    // Usa a variável que guarda o perfil selecionado pelos botões/abas
    if (this.perfilSelecionado === 'SECRETARIA') {
      this.router.navigate(['/dashboard-secretaria']);
    } else if (this.perfilSelecionado === 'PROFESSOR') {
      this.router.navigate(['/dashboard-professor']);
    } else {
      // Perfil ALUNO_RESPONSAVEL
      this.router.navigate(['/dashboard-aluno']);
    }
  } else {
    this.loginForm.markAllAsTouched();
  }
}
}