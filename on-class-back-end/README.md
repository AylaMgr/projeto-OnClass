# OnClass - API Back-end

Serviço responsável pela persistência de dados, autenticação, gestão de papéis (RBAC) e regras de negócio para solicitações de ausência acadêmica no sistema OnClass.

---

## 🛠️ Tecnologias Utilizadas

* *Node.js* com *TypeScript*
* *ORM:* Prisma
* *Banco de Dados:* SQLite (dev.db para desenvolvimento local) / PostgreSQL
* *Validação & Tipagem:* Zod / Class-Validator

---

## 🗄️ Estrutura do Banco de Dados (Prisma)

A API gerencia as seguintes entidades principais:
* User: Perfis de utilizadores (Aluno, Professor, Secretaria).
* Notificacao / Solicitacao: Solicitações de ausência submetidas com datas e anexos.
* Anexo: Metadados e caminho dos comprovantes/atestados submetidos.

---

## ⚙️ Como Executar

### 1. Instalar Dependências
```bash
npm install