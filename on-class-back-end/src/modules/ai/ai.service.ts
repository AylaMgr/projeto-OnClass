import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async analisarDocumento(
    fileBuffer: Buffer,
    mimeType: string,
    nomeAlunoBanco: string
  ) {
    try {
      if (!fileBuffer || fileBuffer.length === 0) {
        throw new BadRequestException('O arquivo enviado está vazio.');
      }

      // Converte o buffer do arquivo recebido para base64
      const base64File = fileBuffer.toString('base64');
      
      // Se for PDF sem mimeType definido, ajusta para application/pdf
      const mimeFinal = mimeType && mimeType !== 'undefined' ? mimeType : 'application/pdf';
      const dataUrl = `data:${mimeFinal};base64,${base64File}`;

      // Prompt com instrução estrita sem preeliminares cegas
      const promptSystem = `
        Você é um auditor de atestados e declarações médicas do sistema escolar OnClass.
        Sua tarefa é LER O DOCUMENTO ANEXADO (imagem ou PDF) e extrair os dados reais contidos nele.

        NOME DO ALUNO CADASTRADO NO SISTEMA: "${nomeAlunoBanco}".

        REGRAS DE VALIDAÇÃO DE ATESTADO / DECLARAÇÃO DE COMPARECIMENTO:
        1. NOME ENCONTRADO: Escreva o nome EXATO do paciente lido no documento.
        2. NOME CONFERE:
           - Marque true se os nomes principais (primeiro nome e pelo menos um sobrenome) forem correspondentes a "${nomeAlunoBanco}".
           - Considere equivalentes nomes com abreviações do meio ou nomes de casada/solteira (ex: "Deborah W. Brito Silva" e "Deborah W. Brito Espindola da Silva").
           - Marque false APENAS se for visivelmente uma pessoa completamente diferente (ex: "Carlos Andrade" vs "${nomeAlunoBanco}").
        3. PERÍODO DE AFASTAMENTO:
           - Se houver quantidade de dias expressa (ex: "1 dia", "02 dias"), extraia esse período.
           - Se for uma DECLARAÇÃO DE COMPARECIMENTO / ATENDIMENTO (ex: "esteve em consulta/tratamento", "impossibilitado de comparecer às atividades no dia X"), CONSIDERE O PERÍODO COMO "1 dia (dia da consulta/atendimento)" e marque "temDiasAfastamento": true.
           - Apenas marque false se o documento realmente não mencionar nenhuma data, consulta, atendimento ou impossibilidade de comparência.
        4. DATA DE EMISSÃO: Escreva a data em que o documento foi assinado/emitido ou a data do atendimento.

        FORMATO DA RESPOSTA (JSON estrito):
        {
          "nomeEncontrado": "Nome lido",
          "nomeConfere": true ou false,
          "datasAfastamento": "Período lido ou '1 dia (Data do Atendimento)'",
          "temDiasAfastamento": true ou false,
          "dataEmissao": "Data lida",
          "temDataEmissao": true ou false,
          "crmMedico": "CRM do médico ou responsável se encontrado",
          "relatorioSecretaria": "Resumo justificando a validação do atestado ou declaração.",
          "sugestaoAcao": "APROVAR" (se nomeConfere, temDiasAfastamento e temDataEmissao forem TODOS true) ou "REJEITAR"
        }
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: promptSystem,
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analise este atestado médico anexado e valide se pertence ao aluno "${nomeAlunoBanco}". ID da requisição: ${Date.now()}`,
              },
              {
                type: 'image_url',
                image_url: {
                  url: dataUrl,
                  detail: 'high',
                },
              },
            ],
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0, // Garante que a IA não invente dados
      });

      const conteudo = response.choices[0]?.message?.content || '{}';
      return JSON.parse(conteudo);
    } catch (error: any) {
      console.error('Erro detalhado na análise da IA:', error?.response?.data || error?.message || error);
      throw new InternalServerErrorException(
        error?.message || 'Falha ao processar a leitura do documento por IA.'
      );
    }
  }
}