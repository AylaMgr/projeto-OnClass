import { Controller, Get, Post, Put, Body } from '@nestjs/common';
import { AdminTiService } from './admin-ti.service.js';

@Controller('admin-ti')
export class AdminTiController {
  constructor(private readonly adminTiService: AdminTiService) {}

  @Get('config')
  obterConfiguracao() {
    return this.adminTiService.obterConfiguracao();
  }

  @Put('config/tema')
  atualizarTema(@Body() dados: { logoUrl?: string; corPrimaria: string; corNavbar: string; corCardsPend: string; corCardsAprov: string; corCardsRecus: string }) {
    return this.adminTiService.atualizarTema(dados);
  }

  @Get('usuarios')
  listarUsuarios() {
    return this.adminTiService.listarUsuarios();
  }

  @Post('usuarios')
  cadastrarUsuario(@Body() dados: { nome: string; email: string; dataNascimento: string; role: string; matricula?: string }) {
    return this.adminTiService.cadastrarUsuario(dados);
  }

  @Get('telemetria')
  obterMetricasUso() {
    return this.adminTiService.obterMetricasUso();
  }

  @Get('suporte')
  listarSuporte() {
    return this.adminTiService.listarContatosSuporte();
  }

  @Post('suporte')
  criarSuporte(@Body() dados: { nome: string; telefone: string; setor: string }) {
    return this.adminTiService.criarContatoSuporte(dados);
  }
}