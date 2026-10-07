# ⚙️ Sistema de Gestão de Abono de Faltas — API Backend

API RESTful desenvolvida em **Node.js** e **TypeScript** com **Prisma ORM**, estruturada para gerenciar e automatizar o fluxo completo de solicitações de abono de faltas, justificativas médicas e requisições de segunda chamada para instituições de ensino.

---

## 🎯 Sobre o Projeto

O backend atua como a camada central de inteligência e persistência de dados do sistema, conectando e gerenciando as permissões e dados entre três perfis principais:
- **Aluno:** Criação de solicitações, upload de atestados/comprovantes e consulta de status.
- **Secretaria:** Análise preliminar, validação de documentos com apoio de metadados e encaminhamento do processo ao corpo docente.
- **Professor:** Consulta de solicitações aceitas/encaminhadas pela secretaria, contagem de dias/aulas a abonar e registro da decisão final.

---

## 🛠️ Tecnologias Utilizadas

- **Runtime:** [Node.js](https://nodejs.org/) (v18.x ou superior)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Framework Web:** [Express.js](https://expressjs.com/)
- **ORM:** [Prisma ORM](https://www.prisma.io/)
- **Banco de Dados:** SQLite (Desenvolvimento) / PostgreSQL (Produção)
- **Autenticação & Segurança:** JSON Web Token (JWT) e BCrypt
- **CORS & Middlewares:** Cors, Body-Parser, Express-Async-Errors

---

## 📌 Fluxo e Ciclo de Vida da Solicitação (`Status`)