import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ObserveInstrument, AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  // Habilita o CORS para permitir requisições do Angular (http://localhost:4200)
  app.enableCors({
    origin: 'http://localhost:4200',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Ativa o pipe global de validação para processar os DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove propriedades que não estejam no DTO
      transform: true, // Converte tipos de dados automaticamente
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();