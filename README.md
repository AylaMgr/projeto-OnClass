# OnClass - Sistema de Gestão de Ausências e Documentação

O *OnClass* é uma plataforma desenvolvida para otimizar a gestão de solicitações de ausência e envio de atestados acadêmicos, conectando Alunos, Professores e a Secretaria num único ecossistema.

---

## 🏗️ Arquitetura do Repositório

O repositório é estruturado em um monorepo simples contendo a aplicação web e o serviço de back-end:

```text
projeto-OnClass/
├── on-class-front-end/   # Aplicação Web (Angular 17+ Standalone Components)
├── on-class-back-end/    # API REST & Banco de Dados (Node.js / Prisma ORM)
└── README.md             # Visão geral da solução
...