import { IsString, IsNotEmpty, IsEmail, IsOptional, IsIn, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUsuarioDto {
  @ApiProperty({ example: 'Jorge Souza' })
  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório!' })
  nome: string;

  @ApiProperty({ example: 'jorge.souza@onclass.edu.br' })
  @IsEmail({}, { message: 'Informe um e-mail válido!' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório!' })
  email: string;

  @ApiProperty({ example: '123456', required: false })
  @IsString()
  @IsOptional()
  dataNascimento?: string;

  @ApiProperty({ example: '123456', required: false })
  @IsString()
  @IsOptional()
  senha?: string;

  @ApiProperty({
    example: 'PROFESSOR',
    enum: ['SECRETARIA', 'PROFESSOR', 'ADMIN_TI', 'ALUNO'],
  })
  @IsString()
  @IsIn(['SECRETARIA', 'PROFESSOR', 'ADMIN_TI', 'ALUNO'], {
    message: 'Perfil inválido! Use SECRETARIA, PROFESSOR, ADMIN_TI ou ALUNO.',
  })
  role: string;

  @ApiProperty({ example: 'PROF202699', required: false })
  @IsString()
  @IsOptional()
  matricula?: string;

  @ApiProperty({ example: ['Matemática', '2º Ano A - Manhã', '3º Ano A - Manhã'], required: false })
  @IsArray()
  @IsOptional()
  turmas?: string[];
}