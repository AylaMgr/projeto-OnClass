import { Controller, Get, Post, Put, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdminTiService } from './admin-ti.service.js';
import { UpdateTemaDto } from './dto/update-tema.dto.js';
import { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import { CreateSuporteDto } from './dto/create-suporte.dto.js';

@ApiTags('Admin TI')
@Controller('admin-ti')
export class AdminTiController {
  constructor(private readonly adminTiService: AdminTiService) {}

  @Get('config')
  @ApiOperation({ summary: 'Obter configurações visuais e plano da instituição' })
  obterConfiguracao() {
    return this.adminTiService.obterConfiguracao();
  }

  @Put('config/tema')
  @ApiOperation({ summary: 'Atualizar cores e logótipo (White-Label)' })
  atualizarTema(@Body() dados: UpdateTemaDto) {
    return this.adminTiService.atualizarTema(dados);
  }

  @Get('usuarios')
  @ApiOperation({ summary: 'Listar utilizadores cadastrados' })
  listarUsuarios() {
    return this.adminTiService.listarUsuarios();
  }

  @Post('usuarios')
  @ApiOperation({ summary: 'Cadastrar novo secretário, professor ou administrador' })
  cadastrarUsuario(@Body() dados: CreateUsuarioDto) {
    return this.adminTiService.cadastrarUsuario(dados);
  }

  @Get('telemetria')
  @ApiOperation({ summary: 'Obter estatísticas de utilização e planos disponíveis' })
  obterMetricasUso() {
    return this.adminTiService.obterMetricasUso();
  }

  @Get('suporte')
  @ApiOperation({ summary: 'Listar contactos de suporte técnico' })
  listarSuporte() {
    return this.adminTiService.listarContatosSuporte();
  }

  @Post('suporte')
  @ApiOperation({ summary: 'Adicionar novo contacto de suporte' })
  criarSuporte(@Body() dados: CreateSuporteDto) {
    return this.adminTiService.criarContatoSuporte(dados);
  }
}