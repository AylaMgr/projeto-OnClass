import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(credentials: { email?: string; pass?: string; role?: string }) {
    // 1. Declaração dos utilizadores de teste
    const usuariosValidos = [
      { email: 'professor@email.com', pass: '123456', role: 'PROFESSOR' },
      { email: 'aluno@email.com', pass: '123456', role: 'ALUNO_RESPONSAVEL' },
      { email: 'aluno@email.com', pass: '123456', role: 'ALUNO' },
      { email: 'secretaria@email.com', pass: '123456', role: 'SECRETARIA' },
    ];

    // 2. Busca do utilizador correspondente
    const user = usuariosValidos.find(
      (u) =>
        u.email.toLowerCase() === credentials.email?.toLowerCase() &&
        u.pass === credentials.pass &&
        (!credentials.role || u.role === credentials.role ||
          (credentials.role === 'ALUNO_RESPONSAVEL' && u.role === 'ALUNO') ||
          (credentials.role === 'ALUNO' && u.role === 'SECRETARIA')
        )
    );

    if (!credentials.email || !credentials?.pass) {
      throw new UnauthorizedException('E-mail e senha são obrigatórios.');
    }
    // 3. Validação de segurança
    if (!user) {
      throw new UnauthorizedException('E-mail, senha ou perfil incorretos.');
    }

    // 4. Geração do token JWT e retorno
    const payload = { sub: user.email, email: user.email, role: user.role };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: '123',
        email: user.email,
        role: user.role,
      },
    };
  }
}