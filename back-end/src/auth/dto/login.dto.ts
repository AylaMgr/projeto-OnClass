import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'mariana.costa@onclass.edu.br' })
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório.' })
  email: string;

  @ApiProperty({ example: '123456', required: false })
  @IsString()
  @IsOptional()
  senha?: string;

  @ApiProperty({ example: '123456', required: false })
  @IsString()
  @IsOptional()
  pass?: string;

  @ApiProperty({ example: 'SECRETARIA', required: false })
  @IsString()
  @IsOptional()
  role?: string;
}