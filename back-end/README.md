# ⚙️ OnClass - Back-end (NestJS)

API RESTful do ecossistema **OnClass**, responsável pela regra de negócio, gestão de justificativas e atestados escolares, integração com banco de dados SQLite/Prisma ORM e pipeline de triagem inteligente utilizando Inteligência Artificial.

---

## 💻 Requisitos do Sistema e Instalação na Máquina

Siga o passo a passo abaixo para configurar a máquina e instalar todas as dependências necessárias para rodar o projeto do zero.

### 1. Ferramentas Necessárias

Antes de começar, certifique-se de instalar na máquina:

* **Node.js:** Versão 18.x ou superior (LTS recomendada). [Download Node.js](https://nodejs.org/)
* **npm:** Gerenciador de pacotes (já vem instalado com o Node.js) ou **Yarn**.
* **Git:** Para clonar o repositório. [Download Git](https://git-scm.com/)
* **VS Code** (opcional): Editor de código recomendado com as extensões *Prisma* e *NestJS Snippets*.

Para verificar se o Node e o npm estão instalados corretamente na sua máquina, abra o terminal e execute:
```bash
node -v
npm -v

Acessar o Diretório

# Clone o repositório (caso ainda não tenha feito)
git clone <URL_DO_REPOSITORIO>

# Acesse a pasta do backend
cd projeto-OnClass/back-end

# instalar dependências
npm install

npm install openai

Configurar variáveis de ambiente

# Porta de execução do servidor NestJS
PORT=3000

# URL de Conexão do Banco de Dados SQLite (via Prisma)
DATABASE_URL="file:./dev.db"

# Chaves de API / Integração de IA (se aplicável)
# OPENAI_API_KEY="sua_chave_aqui"

Configurar e Rodar as Migrações do Banco de Dados (Prisma)

# Gera os tipos atualizados do Prisma Client
npx prisma generate

Executando a API

npm run start:dev