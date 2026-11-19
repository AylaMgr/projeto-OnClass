import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IaService } from './ai.service.js';
import { NotificacoesService } from '../notificacoes/notificacoes.service.js';

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: IaService,
    private readonly notificacoesService: NotificacoesService,
  ) {}

  @Post('upload-atestado')
  @UseInterceptors(FileInterceptor('file'))
  async analisarAtestado(
    @UploadedFile() file: any,
    @Body('alunoId') alunoId?: string,
    @Body('nomeAluno') nomeAluno?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado.');
    }

    const pastaAluno = await this.notificacoesService.obterPastaAluno(
      alunoId || '',
      nomeAluno,
    );
    const arquivoNome = this.notificacoesService.gerarNomeArquivoDataHora(
      file.originalname,
    );

    const resultadoIa = await this.aiService.analisarDocumento(
      file.buffer,
      file.mimetype,
      nomeAluno || 'Aluno não identificado',
    );

    return {
      sucesso: true,
      arquivoOriginal: file.originalname,
      arquivoNome,
      pastaAluno,
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

    return this.notificacoesService.processarUploadAtestado(
      file,
      alunoId,
      nomeAluno,
    );
  }
}