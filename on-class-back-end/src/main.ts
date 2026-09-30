import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
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