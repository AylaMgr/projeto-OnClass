import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma/prisma.service.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async login(credentials: LoginDto) {
    const senhaInformada = credentials?.senha || credentials?.pass;

    if (!credentials?.email || !senhaInformada) {
      throw new UnauthorizedException('E-mail e senha são obrigatórios.');
    }

    const emailInput = credentials.email.toLowerCase().trim();

    // Busca exclusivamente no MongoDB Atlas
    const usuarioBanco = await this.prisma.usuario.findFirst({
      where: {
        email: { equals: emailInput, mode: 'insensitive' },
      },
    });

    if (!usuarioBanco) {
      throw new UnauthorizedException('E-mail não encontrado.');
    }

    if (usuarioBanco.senha !== senhaInformada) {
      throw new UnauthorizedException('Senha incorreta.');
    }

    const roleRecebida =
      credentials.role === 'ALUNO_RESPONSAVEL' || credentials.role === 'RESPONSAVEL'
        ? 'ALUNO'
        : credentials.role;

    if (roleRecebida && usuarioBanco.role !== roleRecebida) {
      throw new UnauthorizedException(
        'O perfil selecionado não corresponde a este e-mail.',
      );
    }

    const payload = {
      sub: usuarioBanco.id,
      userId: usuarioBanco.id,
      email: usuarioBanco.email,
      role: usuarioBanco.role,
      nome: usuarioBanco.nome,
      matricula: usuarioBanco.matricula ?? '',
      turmas: usuarioBanco.turmas ?? [],
      turma: usuarioBanco.turmas?.[0] ?? '',
    };

    // Assina usando o JWT_SECRET configurado no .env via AuthModule
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      accessToken: token,
      user: {
        id: usuarioBanco.id,
        email: usuarioBanco.email,
        role: usuarioBanco.role,
        nome: usuarioBanco.nome,
        turmas: usuarioBanco.turmas ?? [],
        turma: usuarioBanco.turmas?.[0] ?? '',
      },
    };
  }
}