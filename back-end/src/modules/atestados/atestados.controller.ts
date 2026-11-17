import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AtestadosService } from './atestados.service.js';
import { CreateAtestadoDto } from './dto/create-atestado.dto.js';
import { UpdateAtestadoStatusDto } from './dto/update-atestado.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt.auth.guard.js';

@ApiTags('Atestados')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('atestados')
export class AtestadosController {
  constructor(private readonly atestadosService: AtestadosService) {}

  @Post()
  @ApiOperation({ summary: 'Enviar novo atestado médico (JSON ou Multipart)' })
  @UseInterceptors(FileInterceptor('arquivo'))
  async create(
    @Body() dto: CreateAtestadoDto,
    @UploadedFile() file?: any,
  ) {
    if (file) {
      dto.arquivoNome = file.originalname;
      dto.arquivoTipo = file.mimetype;
      dto.arquivoBase64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    }
    return this.atestadosService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar atestados conforme o perfil do utilizador' })
  async findAll(@Req() req: any) {
    const user = req.user;
    if (user.role === 'ALUNO') {
      const alunoId = user.userId ?? user.id;
      return this.atestadosService.findByAluno(alunoId);
    }
    return this.atestadosService.findAll();
  }

  @Get(':id/arquivo')
  @ApiOperation({ summary: 'Obter ficheiro Base64 do atestado com verificação de sigilo' })
  async getArquivo(@Param('id') id: string, @Req() req: any) {
    return this.atestadosService.findArquivoSeguro(id, req.user);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Aprovar ou recusar atestado (Secretaria/Admin)' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateAtestadoStatusDto,
    @Req() req: any,
  ) {
    if (req.user.role === 'ALUNO') {
      throw new ForbiddenException(
        'Alunos não têm permissão para alterar o estado de atestados.',
      );
    }
    return this.atestadosService.updateStatus(id, dto);
  }
}