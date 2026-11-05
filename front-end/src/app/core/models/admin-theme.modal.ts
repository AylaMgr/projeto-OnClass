export interface TemaConfig {
  logoUrl?: string;
  corPrimaria: string;
  corNavbar: string;
  corCardsPend: string;
  corCardsAprov: string;
  corCardsRecus: string;
}

export interface WhiteLabelConfig {
  nomeExibido: string;
  dominio: string;
  logoUrl?: string;
  telaSelecionada: string;
  coresGlobal: TemaConfig;
  coresPorTela: {
    [chaveTela: string]: Partial<TemaConfig>;
  };
}