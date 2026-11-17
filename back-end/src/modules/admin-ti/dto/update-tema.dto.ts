import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTemaDto {
  @ApiProperty({ example: 'https://escola.com/logo.png', required: false })
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @ApiProperty({ example: '#1e3a8a' })
  @IsString()
  @IsNotEmpty({ message: 'A cor primária é obrigatória!' })
  corPrimaria: string;

  @ApiProperty({ example: '#1e3a8a' })
  @IsString()
  @IsNotEmpty({ message: 'A cor da navbar é obrigatória!' })
  corNavbar: string;

  @ApiProperty({ example: '#fef3c7' })
  @IsString()
  @IsNotEmpty({ message: 'A cor dos cards pendentes é obrigatória!' })
  corCardsPend: string;

  @ApiProperty({ example: '#d1fae5' })
  @IsString()
  @IsNotEmpty({ message: 'A cor dos cards aprovados é obrigatória!' })
  corCardsAprov: string;

  @ApiProperty({ example: '#fee2e2' })
  @IsString()
  @IsNotEmpty({ message: 'A cor dos cards recusados é obrigatória!' })
  corCardsRecus: string;
}