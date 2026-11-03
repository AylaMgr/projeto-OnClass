-- CreateTable
CREATE TABLE "instituicao_config" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nomeInstituicao" TEXT NOT NULL DEFAULT 'Minha Instituição',
    "cnpj" TEXT,
    "logoUrl" TEXT,
    "corPrimaria" TEXT NOT NULL DEFAULT '#1e3a8a',
    "corCardsPend" TEXT NOT NULL DEFAULT '#fef3c7',
    "corCardsAprov" TEXT NOT NULL DEFAULT '#d1fae5',
    "corCardsRecus" TEXT NOT NULL DEFAULT '#fee2e2',
    "planoContratado" TEXT NOT NULL DEFAULT 'PRO',
    "limiteAlunos" INTEGER NOT NULL DEFAULT 1000,
    "limiteProfessores" INTEGER NOT NULL DEFAULT 50,
    "limiteSecretaria" INTEGER NOT NULL DEFAULT 10,
    "renovacaoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "contatos_suporte" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "setor" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "matricula" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_matricula_key" ON "usuarios"("matricula");
