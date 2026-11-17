import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateAtestadoDto {
  @ApiProperty({
    example: '673a9f12c8e4b20012a4b5c6',
    description: 'ObjectId do aluno no MongoDB',
  })
  @IsString()
  @IsNotEmpty({ message: 'O ID do aluno é obrigatório!' })
  alunoId: string;

  @ApiProperty({ example: 'Dr. Carlos Andrade', required: false })
  @IsString()
  @IsOptional()
  medico?: string;

  @ApiProperty({ example: 'CRM/SP 123456', required: false })
  @IsString()
  @IsOptional()
  crm?: string;

  @ApiProperty({ example: 'J06.9', required: false })
  @IsString()
  @IsOptional()
  cid?: string;

  @ApiProperty({ example: '17/11/2026', required: false })
  @IsString()
  @IsOptional()
  dataInicio?: string;

  @ApiProperty({ example: 2, description: 'Dias de afastamento', required: false })
  @Type(() => Number)
  @IsInt({ message: 'Os dias de afastamento devem ser um número inteiro.' })
  @Min(1, { message: 'O afastamento deve ser de pelo menos 1 dia.' })
  @IsOptional()
  diasAfastado?: number;

  @ApiProperty({ example: 'atestado_medico.pdf', required: false })
  @IsString()
  @IsOptional()
  arquivoNome?: string;

  @ApiProperty({ example: 'application/pdf', required: false })
  @IsString()
  @IsOptional()
  arquivoTipo?: string;

  @ApiProperty({
    example: 'data:application/pdf;base64,JVBERi0xLjQK...',
    description: 'Conteúdo do ficheiro convertido em Base64',
    required: false,
  })
  @IsString()
  @IsOptional()
  arquivoBase64?: string;
}