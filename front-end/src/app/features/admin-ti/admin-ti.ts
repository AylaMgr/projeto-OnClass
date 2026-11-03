import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ThemeService, TemaConfig } from '../../core/services/theme.service';

@Component({
  selector: 'app-admin-ti',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-ti.html',
  styleUrls: ['./admin-ti.css']
})
export class AdminTiComponent implements OnInit {
  abaAtiva: 'branding' | 'usuarios' | 'planos' | 'suporte' | 'telemetria' = 'branding';

  tema: TemaConfig = {
  corPrimaria: '#1e3a8a',
  corNavbar: '#1e3a8a',
  corCardsPend: '#fef3c7',
  corCardsAprov: '#d1fae5',
  corCardsRecus: '#fee2e2',
  logoUrl: ''
};

  novoUsuario = { nome: '', email: '', dataNascimento: '', role: 'SECRETARIA', matricula: '' };
  novoContato = { nome: '', telefone: '', setor: 'TI Local' };

  telemetria: any = null;
  contatosSuporte: any[] = [];
  usuarios: any[] = [];

  constructor(private http: HttpClient, private themeService: ThemeService) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.http.get<TemaConfig>('http://localhost:3000/admin-ti/config').subscribe((res) => {
      if (res) this.tema = res;
    });

    this.http.get('http://localhost:3000/admin-ti/telemetria').subscribe((res) => {
      this.telemetria = res;
    });

    this.http.get<any[]>('http://localhost:3000/admin-ti/suporte').subscribe((res) => {
      this.contatosSuporte = res;
    });

    this.http.get<any[]>('http://localhost:3000/admin-ti/usuarios').subscribe((res) => {
      this.usuarios = res;
    });
  }

  salvarTema(): void {
    this.http.put('http://localhost:3000/admin-ti/config/tema', this.tema).subscribe(() => {
      this.themeService.aplicarVariaveisCss(this.tema);
      alert('Tema e marca atualizados com sucesso!');
    });
  }

  cadastrarUsuario(): void {
    if (!this.novoUsuario.nome || !this.novoUsuario.email) return;
    this.http.post('http://localhost:3000/admin-ti/usuarios', this.novoUsuario).subscribe(() => {
      alert(`${this.novoUsuario.role} cadastrado com sucesso!`);
      this.novoUsuario = { nome: '', email: '', dataNascimento: '', role: 'SECRETARIA', matricula: '' };
      this.carregarDados();
    });
  }

  cadastrarContato(): void {
    if (!this.novoContato.nome || !this.novoContato.telefone) return;
    this.http.post('http://localhost:3000/admin-ti/suporte', this.novoContato).subscribe(() => {
      this.carregarDados();
      this.novoContato = { nome: '', telefone: '', setor: 'TI Local' };
    });
  }
}