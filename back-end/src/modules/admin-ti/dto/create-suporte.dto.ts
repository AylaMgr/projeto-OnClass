import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSuporteDto {
  @ApiProperty({ example: 'Suporte Técnico Nível 1' })
  @IsString()
  @IsNotEmpty({ message: 'O nome do contato é obrigatório!' })
  nome: string;

  @ApiProperty({ example: '(96) 99999-0000' })
  @IsString()
  @IsNotEmpty({ message: 'O telefone é obrigatório!' })
  telefone: string;

  @ApiProperty({ example: 'TI / Infraestrutura' })
  @IsString()
  @IsNotEmpty({ message: 'O setor é obrigatório!' })
  setor: string;
}