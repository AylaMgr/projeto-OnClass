import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService, NovoUsuarioPayload } from '../../../core/services/admin-api.service';

@Component({
  selector: 'app-equipe',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './equipe.html',
  styleUrls: ['./equipe.css']
})
export class EquipeComponent implements OnInit {
  usuarios: any[] = [];
  
  novoUsuario: NovoUsuarioPayload = {
    nome: '',
    email: '',
    dataNascimento: '',
    role: 'SECRETARIA',
    matricula: ''
  };

  constructor(private adminApi: AdminApiService) {}

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  carregarUsuarios(): void {
    this.adminApi.obterUsuarios().subscribe({
      next: (res) => this.usuarios = res,
      error: (err) => console.error('Erro ao carregar usuários:', err)
    });
  }

  cadastrarUsuario(): void {
    if (!this.novoUsuario.nome || !this.novoUsuario.email) return;

    this.adminApi.cadastrarUsuario(this.novoUsuario).subscribe({
      next: () => {
        alert(`${this.novoUsuario.role} cadastrado com sucesso!`);
        this.novoUsuario = { nome: '', email: '', dataNascimento: '', role: 'SECRETARIA', matricula: '' };
        this.carregarUsuarios();
      },
      error: (err) => console.error('Erro ao cadastrar usuário:', err)
    });
  }
}