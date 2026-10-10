import { Controller, Post, UseInterceptors, UploadedFile, Body, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AiService } from './ai.service.js';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import * as fs from 'fs';
import * as path from 'path';

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('upload-atestado')
  @UseInterceptors(FileInterceptor('file'))
  async analisarAtestado(
    @UploadedFile() file: any,
    @Body('nomeAluno') nomeAluno: string,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado.');
    }

    // Chama a IA enviando o arquivo (Imagem ou PDF)
    const resultadoIa = await this.aiService.analisarDocumento(
      file.buffer,
      file.mimetype,
      nomeAluno || 'Aluno não identificado',
    );

    return {
      sucesso: true,
      arquivoOriginal: file.originalname,
      analiseIA: resultadoIa,
    };
  }

  @Post('criar-solicitacao-atestado')
  @UseInterceptors(FileInterceptor('file'))
  async criarSolicitacaoAtestado(
    @UploadedFile() file: any,
    @Body('alunoId') alunoId: string,
    @Body('nomeAluno') nomeAluno: string,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado.');
    }

    if (!alunoId) {
      throw new BadRequestException('ID do aluno não fornecido.');
    }

    // 1. Processa a leitura visual via IA
    const resultadoIa = await this.aiService.analisarDocumento(
      file.buffer,
      file.mimetype,
      nomeAluno || 'Aluno não identificado',
    );

    // 2. Define o status inicial no banco com base no resultado da IA
    const ehAprovado = resultadoIa.sugestaoAcao === 'APROVAR';
    const statusInicial = ehAprovado
      ? 'Solicitação Aprovada Definitivamente'
      : 'Em Análise pela Secretaria';

    const administradorOrigem = ehAprovado ? 'IA OnClass' : 'Secretaria';

    // 3. Salva a imagem/PDF em disco no servidor
    const pastaUploads = path.join(process.cwd(), 'uploads', 'atestados');
    if (!fs.existsSync(pastaUploads)) {
      fs.mkdirSync(pastaUploads, { recursive: true });
    }

    const nomeArquivoSalvo = `${Date.now()}-${file.originalname}`;
    const caminhoCompleto = path.join(pastaUploads, nomeArquivoSalvo);
    const caminhoRelativo = `uploads/atestados/${nomeArquivoSalvo}`;

    fs.writeFileSync(caminhoCompleto, file.buffer);

    // 4. Salva a solicitação na tabela NOTIFICACAO do Prisma
    const dataHoje = new Date();

    const novaNotificacao = await this.prisma.notificacao.create({
      data: {
        alunoId: alunoId,
        motivo: 'Tratamento Médico (IA)',
        descricao: resultadoIa.relatorioSecretaria || 'Envio de atestado via IA',
        dataInicio: dataHoje,
        dataFim: dataHoje,
        declaracaoVeracidade: true,
        administrador: administradorOrigem,
        status: statusInicial,
      },
    });

    return {
      sucesso: true,
      mensagem: 'Solicitação registrada com sucesso no banco de dados.',
      dados: novaNotificacao,
      resultadoIa,
      caminhoArquivo: caminhoRelativo,
    };
  }
}