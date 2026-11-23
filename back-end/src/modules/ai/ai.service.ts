import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import OpenAI from 'openai';
import { PDFParse } from 'pdf-parse';

// Desativa a validação estrita de certificados SSL locais para todo o processo Node.js
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; 

@Injectable()
export class IaService {
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    // console.log('--- TESTE CHAVE OPENAI ---:', apiKey ? `${apiKey.substring(0, 15)}...` : 'NÃO ENCONTRADA');

    this.openai = new OpenAI({
      apiKey: apiKey,
      timeout: 30000,
      maxRetries: 2,
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
      const isPdf = mimeFinal.toLowerCase().includes('pdf');

      // Prompt universal capaz de identificar qualquer formato de atestado/declaração e normalizar a saída
    const promptSystem = `
Você é um auditor especialista em documentos médicos e escolares no Brasil (sistema OnClass).
Sua tarefa é LER O DOCUMENTO ANEXADO (imagem ou PDF), identificar o tipo/layout do documento e devolver os dados NORMALIZADOS em um único formato JSON padrão.

NOME DO ALUNO CADASTRADO NO SISTEMA: "${nomeAlunoBanco}".

PASSO 1 — IDENTIFICAÇÃO DO TIPO DE DOCUMENTO:
Classifique internamente qual formato foi enviado:
- "ATESTADO_MEDICO": atestado clínico, telemedicina, UPA/SUS, hospital ou consultório particular concedendo dias de afastamento.
- "DECLARACAO_COMPARECIMENTO": declaração de consulta, exame ou comparecimento por horas/turno (considere diasAfastamento = 1 na data do atendimento).
- "ATESTADO_ODONTOLOGICO": atestado emitido por dentista/CRO.
- "OUTRO": documento médico/escolar diverso ou ilegível.

PASSO 2 — REGRAS ESTRITAS DE EXTRAÇÃO E NORMALIZAÇÃO:
1. NOME ENCONTRADO: Escreva o nome EXATO do paciente lido no documento.
2. NOME CONFERE:
   - Marque true se o primeiro nome e pelo menos um sobrenome corresponderem a "${nomeAlunoBanco}".
   - Aceite abreviações do meio ou nomes de casada/solteira (ex: "Deborah W. Brito Silva" e "Deborah W. Brito Espindola da Silva").
   - Marque false APENAS se for claramente outra pessoa.
3. REGRAS OBRIGATÓRIAS DE DATA (PADRÃO BRASIL DD/MM/AAAA):
   - TODAS as datas numéricas no documento estão no padrão brasileiro DD/MM/AAAA (Dia/Mês/Ano). NUNCA inverta dia e mês (ex: "11/09/2026" é dia 11, mês 09, ano 2026 = "2026-09-11", JAMAIS "2026-11-09").
   - Se a data estiver por extenso (ex: "11 de setembro de 2026"), converta para "2026-09-11".
   - NUNCA use datas fictícias ou de exemplo. Extraia estritamente o que está escrito na imagem/PDF.
   - Se o texto disser "na data de hoje" ou "a partir desta data", use a Data de emissão/atendimento do documento como "dataInicio".
4. CÁLCULO DE DIAS E DATA FINAL:
   - Converta quantidades por extenso para inteiro em "diasAfastamento" ("um dia" = 1, "dois dias" = 2, "três dias" = 3, "quatro dias" = 4, "cinco dias" = 5, etc.). Se for declaração de comparecimento por horas, use 1.
   - Se o documento informar explicitamente data inicial e data final (ex: "de 11/09/2026 a 13/09/2026"), converta ambas para AAAA-MM-DD e calcule diasAfastamento.
   - Caso contrário, calcule "dataFim" somando (diasAfastamento - 1) dias a partir de "dataInicio" no formato AAAA-MM-DD (ex: início 2026-09-11 com 1 dia -> dataFim = "2026-09-11"; início 2026-09-11 com 3 dias -> dataFim = "2026-09-13").
   - Só marque "temDiasAfastamento": false se o documento não tiver nenhuma data de consulta, atendimento ou afastamento.
5. DATA DE EMISSÃO E RESPONSÁVEL:
   - Extraia a data de emissão/assinatura no formato DD/MM/AAAA em "dataEmissao".
   - Extraia o nome do profissional em "nomeMedico" e o conselho (CRM/CRO) em "crmMedico".

FORMATO ÚNICO DE RESPOSTA (JSON estrito, sem markdown):
{
  "tipoDocumento": "ATESTADO_MEDICO",
  "nomeEncontrado": "Nome exato lido",
  "nomeConfere": true,
  "dataInicio": "AAAA-MM-DD",
  "dataFim": "AAAA-MM-DD",
  "diasAfastamento": 1,
  "datasAfastamento": "DD/MM/AAAA até DD/MM/AAAA (1 dia)",
  "temDiasAfastamento": true,
  "dataEmissao": "DD/MM/AAAA",
  "temDataEmissao": true,
  "nomeMedico": "Nome do médico/dentista",
  "crmMedico": "CRM ou CRO encontrado",
  "cid": "CID se houver ou N/I",
  "relatorioSecretaria": "Resumo claro informando o tipo de documento, período exato DD/MM/AAAA até DD/MM/AAAA e profissional.",
  "sugestaoAcao": "APROVAR"
}
Regra para "sugestaoAcao": retorne "APROVAR" somente se nomeConfere, temDiasAfastamento e temDataEmissao forem TODOS true; caso contrário retorne "REJEITAR".
`;

      // Monta o payload conforme o tipo do arquivo (Imagem vs PDF)
      const contentPayload: any[] = [
        {
          type: 'text',
          text: `Analise este atestado médico anexado e valide se pertence ao aluno "${nomeAlunoBanco}". ID da requisição: ${Date.now()}`,
        },
      ];

      if (!isPdf) {
  // Envia como imagem em alta resolução (PNG, JPG, WEBP)
  contentPayload.push({
    type: 'image_url',
    image_url: {
      url: dataUrl,
      detail: 'high',
    },
  });
} else {
  // Extrai o texto real do PDF antes de enviar para a IA
  const pdfBuffer = Buffer.from(base64File, 'base64');
  const parser = new PDFParse({ data: pdfBuffer });
  const pdfData = await parser.getText();
  await parser.destroy();
  const textoExtraidoPdf = (pdfData.text || '').trim();
  if (!textoExtraidoPdf || textoExtraidoPdf.length < 15) {
    throw new BadRequestException(
      'Este PDF parece ser uma imagem digitalizada sem texto selecionável. Por favor, envie uma foto ou print (PNG/JPG) do atestado.',
    );
  }

  contentPayload.push({
    type: 'text',
    text: `TEXTO EXTRAÍDO DO ATESTADO EM PDF:\n\n${textoExtraidoPdf}`,
  });

      }

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: promptSystem },
          { role: 'user', content: contentPayload },
        ],
        response_format: { type: 'json_object' },
        temperature: 0,
      });

      const conteudo = response.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(conteudo);

    // Garante dataInicio e dataFim em ISO (AAAA-MM-DD) mesmo se o modelo só preencher dataEmissao
    if (!parsed.dataInicio && parsed.dataEmissao && /^\d{2}\/\d{2}\/\d{4}$/.test(parsed.dataEmissao)) {
      const [d, m, a] = parsed.dataEmissao.split('/');
      parsed.dataInicio = `${a}-${m}-${d}`;
    }
    if (parsed.dataInicio && !parsed.dataFim) {
      const qtd = Number(parsed.diasAfastamento) || 1;
      const dt = new Date(`${parsed.dataInicio}T12:00:00`);
      if (qtd > 1) dt.setDate(dt.getDate() + (qtd - 1));
      parsed.dataFim = dt.toISOString().split('T')[0];
    }

    return parsed;
    } catch (error: any) {
      console.error('--- ERRO DETALHADO NA IA ---');
      console.error('Mensagem:', error?.message);
      console.error('Causa de Rede:', error?.cause || error?.code || 'N/A');
      console.error('---------------------------');

      throw new InternalServerErrorException(
        error?.message || 'Falha ao processar a leitura do documento por IA.'
      );
    }
  }
}