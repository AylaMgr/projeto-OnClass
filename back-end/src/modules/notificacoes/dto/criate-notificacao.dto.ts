import { IsNotEmpty, IsString, IsDateString, IsBoolean, Equals } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNotificacaoDto {
  @ApiProperty({ example: 'Consulta médica de rotina' })
  @IsString({ message: 'O motivo deve ser um texto.' })
  @IsNotEmpty({ message: 'O motivo é obrigatório.' })
  motivo: string;

  @ApiProperty({ example: '2026-11-17' })
  @IsDateString({}, { message: 'A data de início deve estar no formato AAAA-MM-DD.' })
  @IsNotEmpty({ message: 'A data de início é obrigatória.' })
  dataInicio: string;

  @ApiProperty({ example: '2026-11-18' })
  @IsDateString({}, { message: 'A data de fim deve estar no formato AAAA-MM-DD.' })
  @IsNotEmpty({ message: 'A data de fim é obrigatória.' })
  dataFim: string;

  @ApiProperty({ example: 'Ausência justificada no período da manhã.' })
  @IsString({ message: 'A descrição deve ser um texto.' })
  @IsNotEmpty({ message: 'A descrição é obrigatória.' })
  descricao: string;

  @ApiProperty({ example: true })
  @IsBoolean({ message: 'A declaração de veracidade deve ser um valor booleano.' })
  @Equals(true, { message: 'É necessário aceitar a declaração de veracidade para enviar.' })
  declaracaoVeracidade: boolean;
}