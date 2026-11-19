import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { PrismaService } from './common/prisma/prisma.service.js';
import { faker } from '@faker-js/faker/locale/pt_BR';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);

  console.log('🌱 Iniciando a Geração de Faker Usuários (OnClass)... 🌱');

  const turmasDisponiveis = [
    '1º Ano A - Manhã',
    '1º Ano B - Tarde',
    '2º Ano A - Manhã',
    '2º Ano B - Tarde',
    '3º Ano A - Manhã',
    '3º Ano B - Tarde',
    '9º Ano A - Manhã',
    '9º Ano B - Tarde',
  ];

  // Garante os 3 logins principais de teste com senha 123456
  const usuariosFixos = [
    {
      nome: 'Mariana Costa',
      email: 'mariana.costa@onclass.edu.br',
      senha: '123456',
      dataNascimento: '123456',
      role: 'SECRETARIA',
      matricula: 'SEC20261',
      turmas: [],
    },
    {
      nome: 'Prof. Roberto Almeida',
      email: 'roberto.almeida@onclass.edu.br',
      senha: '123456',
      dataNascimento: '123456',
      role: 'PROFESSOR',
      matricula: 'PROF20261',
      turmas: faker.helpers.arrayElements(turmasDisponiveis, { min: 1, max: 5 }),
    },
    {
      nome: 'Lucas Mendes',
      email: 'lucas.mendes@onclass.edu.br',
      senha: '123456',
      dataNascimento: '123456',
      role: 'ALUNO',
      matricula: '20260001',
      turmas: ['2º Ano A - Manhã'],
    },
  ];

  for (const fixo of usuariosFixos) {
    try {
      await prisma.usuario.create({ data: fixo });
    } catch {
      console.log(`Pular: Usuário fixo ${fixo.email} já existe.`);
    }
  }

  // Gera o restante até completar 150 usuários (10 Secretários, 30 Professores, 110 Alunos)
  for (let i = 3; i < 150; i++) {
    let role = 'ALUNO';
    let turmasAleatorias: string[] = [];

    if (i < 10) {
      role = 'SECRETARIA';
      turmasAleatorias = [];
    } else if (i < 40) {
      role = 'PROFESSOR';
      turmasAleatorias = faker.helpers.arrayElements(turmasDisponiveis, { min: 1, max: 5 });
    } else {
      role = 'ALUNO';
      turmasAleatorias = faker.helpers.arrayElements(turmasDisponiveis, { min: 1, max: 1 });
    }

    const nomeCompleto = faker.person.fullName();
    const emailFaker = faker.internet
      .email({ firstName: nomeCompleto.split(' ')[0], lastName: `${i}`, provider: 'onclass.edu.br' })
      .toLowerCase();

    const usuarioFaker = {
      nome: role === 'PROFESSOR' ? `Prof. ${nomeCompleto}` : nomeCompleto,
      email: emailFaker,
      senha: '123456',
      dataNascimento: '123456',
      role,
      matricula: faker.string.numeric(6),
      turmas: turmasAleatorias,
    };

    try {
      await prisma.usuario.create({
        data: usuarioFaker,
      });
    } catch (error) {
      console.log(`Pular: Erro ao Criar Usuário ${usuarioFaker.nome}! - Email ou Matrícula Duplicada`);
    }
  }

  console.log('✅ Banco de dados Populado com Sucesso (150 Usuários)!');

  await app.close();
}

bootstrap();