import { IsNotEmpty, IsString, IsDateString, IsBoolean, Equals } from 'class-validator';

export class CreateNotificacaoDto {
  @IsString({ message: 'O motivo deve ser um texto.' })
  @IsNotEmpty({ message: 'O motivo é obrigatório.' })
  motivo: string;

  @IsDateString({}, { message: 'A data de início deve estar no formato AAAA-MM-DD.' })
  @IsNotEmpty({ message: 'A data de início é obrigatória.' })
  dataInicio: string;

  @IsDateString({}, { message: 'A data de fim deve estar no formato AAAA-MM-DD.' })
  @IsNotEmpty({ message: 'A data de fim é obrigatória.' })
  dataFim: string;

  @IsString({ message: 'A descrição deve ser um texto.' })
  @IsNotEmpty({ message: 'A descrição é obrigatória.' })
  descricao: string;

  @IsBoolean({ message: 'A declaração de veracidade deve ser um valor booleano.' })
  @Equals(true, { message: 'É necessário aceitar a declaração de veracidade para enviar.' })
  declaracaoVeracidade: boolean;
}