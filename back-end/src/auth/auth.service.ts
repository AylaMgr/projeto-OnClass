import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(credentials: { email?: string; pass?: string; role?: string }) {
    // 1. Validação dos campos obrigatórios
    if (!credentials.email || !credentials.pass) {
      throw new UnauthorizedException('E-mail e senha são obrigatórios.');
    }

    // Declaração dos utilizadores de teste
    const usuariosValidos = [
      { email: 'professor@email.com', pass: '123456', role: 'PROFESSOR' },
      { email: 'aluno@email.com', pass: '123456', role: 'ALUNO_RESPONSAVEL' },
      { email: 'aluno@email.com', pass: '123456', role: 'ALUNO' },
      { email: 'secretaria@email.com', pass: '123456', role: 'SECRETARIA' },
      { email: 'renato@email.com', pass: '123456', role: 'ALUNO', nome: 'Renato Alencar da Silva' },
      { email: 'deborah@email.com', pass: '123456', role: 'ALUNO', nome: 'Deborah W. Brito Espindola da Silva' },
      { email: 'julia@email.com', pass: '123456', role: 'ALUNO', nome: 'Julia Brito' },
      { email: 'ayla@email.com', pass: '123456', role: 'ALUNO', nome: 'Ayla Margarida Sales Pessoa' },
      { email: 'rebeca@email.com', pass: '123456', role: 'ALUNO', nome: 'Rebeca Felix' },
    ];

    const emailInput = credentials.email.toLowerCase();

    // 2. Procura contas cadastradas com este e-mail
    const contasComEsteEmail = usuariosValidos.filter(
      (u) => u.email.toLowerCase() === emailInput
    );

    if (contasComEsteEmail.length === 0) {
      throw new UnauthorizedException('E-mail não encontrado.');
    }

    // 3. Verifica se a senha informada está correta
    const contaComSenhaCorreta = contasComEsteEmail.find(
      (u) => u.pass === credentials.pass
    );

    if (!contaComSenhaCorreta) {
      throw new UnauthorizedException('Senha incorreta.');
    }

    // 4. Verifica se o perfil selecionado é compatível com o e-mail
    if (credentials.role) {
      const perfilValido = contasComEsteEmail.some((u) => {
        if (u.role === credentials.role) return true;
        if (credentials.role === 'ALUNO_RESPONSAVEL' && u.role === 'ALUNO') return true;
        if (credentials.role === 'ALUNO' && u.role === 'SECRETARIA') return true;
        return false;
      });

      if (!perfilValido) {
        throw new UnauthorizedException('O perfil selecionado não corresponde a este e-mail.');
      }
    }

    const user = contaComSenhaCorreta;

    // 5. Geração do token JWT e retorno
    const payload = {
      sub: user.email,
      email: user.email,
      role: user.role,
      nome: (user as any).nome || 'Usuário OnClass',
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: '123',
        email: user.email,
        role: user.role,
        nome: (user as any).nome || 'Usuário OnClass',
      },
    };
  }
}