import { IsString, IsNotEmpty, IsEmail, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUsuarioDto {
  @ApiProperty({ example: 'Mariana Costa' })
  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório!' })
  nome: string;

  @ApiProperty({ example: 'mariana.costa@onclass.edu.br' })
  @IsEmail({}, { message: 'Informe um e-mail válido!' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório!' })
  email: string;

  @ApiProperty({ example: '15/05/1990', description: 'Senha padrão (data de nascimento ou código de 6 dígitos)' })
  @IsString()
  @IsNotEmpty({ message: 'A data de nascimento / senha inicial é obrigatória!' })
  dataNascimento: string;

  @ApiProperty({
    example: 'SECRETARIA',
    enum: ['SECRETARIA', 'PROFESSOR', 'ADMIN_TI', 'ALUNO'],
  })
  @IsString()
  @IsIn(['SECRETARIA', 'PROFESSOR', 'ADMIN_TI', 'ALUNO'], {
    message: 'Perfil inválido! Use SECRETARIA, PROFESSOR, ADMIN_TI ou ALUNO.',
  })
  role: string;

  @ApiProperty({ example: 'FUNC-202601', required: false })
  @IsString()
  @IsOptional()
  matricula?: string;
}