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

    // 1. Procura primeiro no MongoDB Atlas (utilizadores reais cadastrados)
    const usuarioBanco = await this.prisma.usuario.findFirst({
      where: {
        email: { equals: emailInput, mode: 'insensitive' },
      },
    });

    if (usuarioBanco) {
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
    };

      const token = this.jwtService.sign(payload, { secret: 'FOCASSIA' });

      return {
        access_token: token,
        accessToken: token,
        user: {
          id: usuarioBanco.id,
          email: usuarioBanco.email,
          role: usuarioBanco.role,
          nome: usuarioBanco.nome,
        },
      };
    }

    // 2. Fallback para os utilizadores de teste em memória
    const usuariosValidos = [
      { email: 'professor@email.com', pass: '123456', role: 'PROFESSOR', nome: 'Professor OnClass' },
      { email: 'aluno@email.com', pass: '123456', role: 'ALUNO_RESPONSAVEL', nome: 'Aluno Responsável' },
      { email: 'aluno@email.com', pass: '123456', role: 'ALUNO', nome: 'Aluno OnClass' },
      { email: 'secretaria@email.com', pass: '123456', role: 'SECRETARIA', nome: 'Secretaria OnClass' },
      { email: 'renato@email.com', pass: '123456', role: 'ALUNO', nome: 'Renato Alencar da Silva' },
      { email: 'deborah@email.com', pass: '123456', role: 'ALUNO', nome: 'Deborah W. Brito Espindola da Silva' },
      { email: 'julia@email.com', pass: '123456', role: 'ALUNO', nome: 'Julia Brito' },
      { email: 'ayla@email.com', pass: '123456', role: 'ALUNO', nome: 'Ayla Margarida Sales Pessoa' },
      { email: 'rebeca@email.com', pass: '123456', role: 'ALUNO', nome: 'Rebeca Felix' },
    ];

    const contasComEsteEmail = usuariosValidos.filter(
      (u) => u.email.toLowerCase() === emailInput,
    );

    if (contasComEsteEmail.length === 0) {
      throw new UnauthorizedException('E-mail não encontrado.');
    }

    const contaComSenhaCorreta = contasComEsteEmail.find(
      (u) => u.pass === senhaInformada,
    );

    if (!contaComSenhaCorreta) {
      throw new UnauthorizedException('Senha incorreta.');
    }

    const payload = {
      sub: '673a9f12c8e4b20012a4b5c6',
      userId: '673a9f12c8e4b20012a4b5c6',
      email: contaComSenhaCorreta.email,
      role: contaComSenhaCorreta.role,
      nome: contaComSenhaCorreta.nome,
    };

    const token = this.jwtService.sign(payload, { secret: 'FOCASSIA' });

    return {
      access_token: token,
      accessToken: token,
      user: {
        id: '673a9f12c8e4b20012a4b5c6',
        email: contaComSenhaCorreta.email,
        role: contaComSenhaCorreta.role,
        nome: contaComSenhaCorreta.nome,
      },
    };
  }
}