# ⚙️ OnClass — Back-end API (NestJS + Prisma + MongoDB Atlas)

API RESTful responsável pela autenticação JWT, regras de negócio do fluxo de abono de faltas, armazenamento seguro de atestados em Base64 no MongoDB Atlas, análise documental via OpenAI API e configurações do Console Admin White-Label.

---

## 🚀 Tecnologias Utilizadas

* **Framework:** [NestJS](https://nestjs.com/) (Node.js + TypeScript)
* **ORM / Banco de Dados:** [Prisma ORM](https://www.prisma.io/) conectado ao **MongoDB Atlas**
* **Autenticação & Segurança:** `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, Guards por perfil (`JwtAuthGuard`, `RolesGuard`)
* **Validação & Documentação:** `class-validator`, `class-transformer` e **Swagger** (`@nestjs/swagger`)
* **Inteligência Artificial:** SDK oficial da **OpenAI** (`openai`) para leitura e extração estruturada de dados de atestados médicos

---

## 📂 Estrutura de Módulos (`src/`)

```text
src/
├── auth/                  # Login, estratégia JWT, Guards e Decorators de perfil
├── common/
│   └── prisma/            # PrismaService e conexão com MongoDB Atlas
└── modules/
    ├── admin-ti/          # White-Label (tema/logo), Equipe, Suporte e Telemetria
    ├── ai/                # Integração com OpenAI API para análise de atestados
    ├── atestados/         # Upload Base64, consulta segura e laudos da IA
    └── notificacoes/      # Criação, revisão e encaminhamento de justificativas

# Clone o repositório (caso ainda não tenha feito)
git clone <URL_DO_REPOSITORIO>

# Acesse a pasta do backend
cd projeto-OnClass/back-end

# instalar dependências
npm install

npm install openai

Configurar variáveis de ambiente

PORT= 3000 
DATABASE_URL=
OPENAI_API_KEY=
JWT_SECRET =
JWT_EXPIRES_IN=

Configurar e Rodar as Migrações do Banco de Dados (Prisma)

# Gera os tipos atualizados do Prisma Client
npx prisma generate
npx prisma db push

Executando a API

npm run start:dev