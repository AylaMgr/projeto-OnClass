import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAtestadoStatusDto {
  @ApiProperty({
    example: 'APROVADO',
    description: 'Novo estado do atestado',
    enum: ['PENDENTE_ANALISE', 'APROVADO', 'RECUSADO'],
  })
  @IsString()
  // No DTO de atualização de status da notificação
@IsIn(['APROVADO', 'APROVADA', 'ACEITO', 'DEFERIDO', 'RECUSADO', 'RECUSADA', 'REJEITADO', 'INDEFERIDO'], {
  message: 'Status inválido!',
})
status: string;

  @ApiProperty({ example: 'Documento válido confirmado pela secretaria.', required: false })
  @IsString()
  @IsOptional()
  analiseGemini?: string;
}