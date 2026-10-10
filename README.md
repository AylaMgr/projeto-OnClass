# 🚀 Projeto OnClass - Plataforma de Gestão Acadêmica & Atestados

O **OnClass** é uma plataforma acadêmica completa composta por um **Dashboard do Aluno** dinâmico e inteligente, com validação e processamento automatizado de atestados médicos utilizando Inteligência Artificial (OpenAI Vision `gpt-4o-mini`), além de integração em tempo real com a Secretaria e Professores.

---

## 🛠️ Tecnologias Utilizadas

* **Backend:** NestJS, TypeScript, Prisma ORM, Multer (Uploads), OpenAI API
* **Frontend:** Angular, RxJS, TypeScript, HTML5/CSS3
* **Banco de Dados:** SQLite / PostgreSQL (Gerenciado via Prisma)
* **Runtime:** Node.js (v18 ou superior)

---

## 📋 Pré-requisitos da Máquina

Antes de começar, certifique-se de ter as seguintes ferramentas instaladas na sua máquina:

1. **Node.js** (Versão 18.x ou superior) -> [Download Node.js](https://nodejs.org/)
2. **npm** (Vem instalado com o Node) ou **yarn**
3. **Git** -> [Download Git](https://git-scm.com/)
4. **VS Code** (Recomendado) com suporte a Angular e NestJS.

---

## 🔧 Passo a Passo para Clonar e Configurar o Projeto

### 1. Clonar o Repositório

Abra o terminal da sua máquina e execute:

```bash
git clone <URL_DO_SEU_REPOSITORIO_GIT>
cd projeto-OnClass
cd on-class-back-end
npm install
npx prisma generate
npx prisma db push
npm run start:dev


====== front-end ======
cd ..
cd on-class-front-end
npm install
ng serve
```

### 2. login de acesso ao sistema

{ email: 'professor@email.com', pass: '123456', role: 'PROFESSOR' },
      { email: 'aluno@email.com', pass: '123456', role: 'ALUNO_RESPONSAVEL' },
      { email: 'aluno@email.com', pass: '123456', role: 'ALUNO' },
      { email: 'secretaria@email.com', pass: '123456', role: 'SECRETARIA' },
      { email: 'renato@email.com', pass: '123456', role: 'ALUNO', nome: 'Renato Alencar da Silva' },
      { email: 'deborah@email.com', pass: '123456', role: 'ALUNO', nome: 'Deborah W. Brito Espindola da Silva' },
      { email: 'julia@email.com', pass: '123456', role: 'ALUNO', nome: 'Julia Brito' },
      { email: 'ayla@email.com', pass: '123456', role: 'ALUNO', nome: 'Ayla Margarida Sales Pessoa' },
      { email: 'rebeca@email.com', pass: '123456', role: 'ALUNO', nome: 'Rebeca Felix' },