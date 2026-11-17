import { IsString, IsNotEmpty, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateNotificacaoStatusDto {
  @ApiProperty({
    example: 'APROVADA',
    description: 'Novo status da solicitação',
    enum: [
      'Pendente',
      'APROVADA',
      'RECUSADA',
      'ENCAMINHADO_PROFESSOR',
      'SOLICITACAO_APROVADA_DEFINITIVAMENTE',
    ],
  })
  @IsString({ message: 'O status deve ser um texto.' })
  @IsNotEmpty({ message: 'O status é obrigatório.' })
  // No DTO de atualização de status da notificação
@IsIn(['APROVADO', 'APROVADA', 'ACEITO', 'DEFERIDO', 'RECUSADO', 'RECUSADA', 'REJEITADO', 'INDEFERIDO'], {
  message: 'Status inválido!',
})
status: string;
}