-- CreateTable
CREATE TABLE "notificacoes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "alunoId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'AUSENCIA_INFORMAL',
    "motivo" TEXT NOT NULL,
    "dataInicio" DATETIME NOT NULL,
    "dataFim" DATETIME NOT NULL,
    "descricao" TEXT NOT NULL,
    "declaracaoVeracidade" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'Pendente',
    "administrador" TEXT,
    "dataEnvio" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "atestados" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "alunoId" TEXT NOT NULL,
    "medico" TEXT,
    "crm" TEXT,
    "cid" TEXT,
    "dataInicio" TEXT,
    "diasAfastado" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE_ANALISE',
    "analiseGemini" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
