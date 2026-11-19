import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers?.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Token de autenticação não fornecido.');
    }

    const [type, rawToken] = authHeader.split(' ');
    if (type !== 'Bearer' || !rawToken) {
      throw new UnauthorizedException('Formato do token inválido.');
    }

    // Remove eventuais aspas ou espaços copiados por engano no Swagger
    const token = rawToken.replace(/^['"]+|['"]+$/g, '').trim();

    try {
      // Usa automaticamente o JWT_SECRET configurado no .env via AuthModule
      const payload = await this.jwtService.verifyAsync(token);

      const idReal = payload.sub || payload.userId || payload.id;

      request.user = {
        sub: idReal,
        id: idReal,
        userId: idReal,
        email: payload.email,
        role: payload.role,
        nome: payload.nome,
        matricula: payload.matricula,
        turma: payload.turma,
      };
      return true;
    } catch (err: any) {
      throw new UnauthorizedException(`Token inválido ou expirado: ${err?.message}`);
    }
  }
}