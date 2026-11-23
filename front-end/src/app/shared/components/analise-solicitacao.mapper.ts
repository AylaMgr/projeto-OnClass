import {
  DadosAnaliseSolicitacao,
  ItemChecklistIa,
} from "./analise-solicitacao-card/analise-solicitacao-card";

export function MapearParaCardsAnalise(
  origem: any,
  dadosAlunoFallback?: { nome?: string; matricula?: string; curso?: string },
): DadosAnaliseSolicitacao {
 const possuiAnexo =
    typeof origem.possuiAnexo === 'boolean'
      ? origem.possuiAnexo
      : Boolean(
          origem.arquivoUrl ||
            origem.anexoUrl ||
            origem.arquivoSalvo ||
            origem.atestadoId ||
            origem.tipo === 'ATESTADO' ||
            origem.confiancaIa !== undefined ||
            origem.sugestaoAcao,
        );

  const nomeOk = origem.nomeConfere ?? (origem.nomeLido && origem.nomeLido !== 'N/I');
  const dataOk = Boolean(origem.dataInicio || origem.temDiasAfastamento || origem.periodo);
  const crmOk = Boolean(
    (origem.crmMedico && origem.crmMedico !== 'N/I') ||
      (origem.assinaturaMedica && !String(origem.assinaturaMedica).includes('Não Verificada')),
  );
  const assinaturaOk = Boolean(
    (origem.nomeMedico && origem.nomeMedico !== 'N/I') || crmOk,
  );

  const checklist: ItemChecklistIa[] = [
    {
      label: 'Assinatura Médica',
      detalhe: assinaturaOk
        ? `Identificada (${origem.nomeMedico || origem.assinaturaMedica || 'Verificada'})`
        : 'Não detectada ou ilegível',
      valido: assinaturaOk,
    },
    {
      label: 'Número CRM',
      detalhe: crmOk
        ? `Identificado (${origem.crmMedico || origem.crm || 'Presente'})`
        : 'Ausente no cabeçalho/corpo',
      valido: crmOk,
    },
    {
      label: 'Data do Atestado',
      detalhe: dataOk
        ? `Identificado (${origem.periodo || origem.datasAfastamento || origem.dataInicio})`
        : 'Não identificada',
      valido: dataOk,
    },
    {
      label: 'Nome do Paciente',
      detalhe: nomeOk
        ? `Compatível (${origem.nomeEncontrado || origem.nomeLido || dadosAlunoFallback?.nome || 'Aluno'})`
        : `Divergente (${origem.nomeEncontrado || origem.nomeLido || 'Não identificado'})`,
      valido: Boolean(nomeOk),
    },
  ];

  const itensValidos = checklist.filter((i) => i.valido).length;
  const confiancaCalculada = Math.round((itensValidos / checklist.length) * 100);
  const confiancaIa =
    typeof origem.confiancaIa === 'number' ? origem.confiancaIa : confiancaCalculada;

  const aprovadoIa =
    origem.sugestaoAcao === 'APROVAR' ||
    origem.status === 'APROVADA' ||
    confiancaIa >= 75;

  const parecerTipo: 'aprovado' | 'atencao' | 'rejeitado' = aprovadoIa
    ? 'aprovado'
    : confiancaIa >= 50
      ? 'atencao'
      : 'rejeitado';

  const statusParecerIa = aprovadoIa
    ? 'Aprovado pela IA'
    : parecerTipo === 'atencao'
      ? 'Revisão necessária'
      : 'Rejeitado pela IA';

  const statusBadgeHeader =
    origem.status === 'APROVADA'
      ? 'Solicitação Aprovada'
      : origem.status === 'RECUSADA'
        ? 'Solicitação Recusada'
        : possuiAnexo
          ? 'Aguardando decisão humana'
          : 'Em análise pela Secretaria';

  const periodoFormatado =
    origem.periodo ||
    origem.datasAfastamento ||
    (origem.dataInicio && origem.dataFim
      ? origem.dataInicio === origem.dataFim
        ? formatarIsoBr(origem.dataInicio)
        : `${formatarIsoBr(origem.dataInicio)} até ${formatarIsoBr(origem.dataFim)}`
      : 'Não informado');

  return {
    id: origem._id || origem.id,
    alunoNome:
      origem.alunoNome ||
      origem.nomeAluno ||
      dadosAlunoFallback?.nome ||
      origem.nomeEncontrado ||
      'Aluno',
    alunoMatricula: origem.alunoMatricula || origem.matricula || dadosAlunoFallback?.matricula,
    alunoCurso: origem.alunoCurso || origem.curso || dadosAlunoFallback?.curso,
    tipoJustificativa: origem.motivo || origem.tipoJustificativa || 'Atestado Médico',
    periodoSolicitado: periodoFormatado,
    possuiAnexo,
    statusBadgeHeader,
    justificativaTexto: origem.descricao || origem.justificativa,
    confiancaIa,
    statusParecerIa,
    parecerTipo,
    checklist,
    observacaoIa: origem.relatorioSecretaria || origem.parecer || origem.mensagem,
    exibirAlertaLeitura: confiancaIa < 80,
    arquivoUrl: origem.arquivoUrl || origem.anexoUrl || origem.arquivoSalvo,
  };
}

function formatarIsoBr(iso: string): string {
  const limpa = String(iso).split('T')[0];
  const partes = limpa.split('-');
  return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : limpa;
}