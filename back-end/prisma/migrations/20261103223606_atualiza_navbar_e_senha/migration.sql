/*
  Warnings:

  - You are about to drop the `contatos_suporte` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN "dataNascimento" TEXT;
ALTER TABLE "usuarios" ADD COLUMN "senha" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "contatos_suporte";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_instituicao_config" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nomeInstituicao" TEXT NOT NULL DEFAULT 'Minha Instituição',
    "cnpj" TEXT,
    "logoUrl" TEXT,
    "corPrimaria" TEXT NOT NULL DEFAULT '#1e3a8a',
    "corNavbar" TEXT NOT NULL DEFAULT '#1e3a8a',
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
INSERT INTO "new_instituicao_config" ("cnpj", "corCardsAprov", "corCardsPend", "corCardsRecus", "corPrimaria", "createdAt", "id", "limiteAlunos", "limiteProfessores", "limiteSecretaria", "logoUrl", "nomeInstituicao", "planoContratado", "renovacaoEm", "updatedAt") SELECT "cnpj", "corCardsAprov", "corCardsPend", "corCardsRecus", "corPrimaria", "createdAt", "id", "limiteAlunos", "limiteProfessores", "limiteSecretaria", "logoUrl", "nomeInstituicao", "planoContratado", "renovacaoEm", "updatedAt" FROM "instituicao_config";
DROP TABLE "instituicao_config";
ALTER TABLE "new_instituicao_config" RENAME TO "instituicao_config";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
