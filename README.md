# 🎓 OnClass — Plataforma Escolar de Gestão de Faltas e Atestados

O **OnClass** é uma plataforma web completa (Full-Stack) para gestão digital de justificativas de ausência e atestados médicos escolares, com análise automatizada por Inteligência Artificial, fluxo de revisão entre Secretaria e Docentes e console administrativo **White-Label**.

---

## ✨ Principais Funcionalidades

* **Portal do Aluno / Responsável:** Envio de justificativas de falta e upload de atestados médicos (PDF/imagem) com acompanhamento de status em tempo real e acesso à Central de Ajuda.
* **Análise Automatizada com IA (OpenAI API):** Leitura e extração inteligente de dados clínicos (médico, CRM, CID, data de início e dias de afastamento) para apoio à triagem da secretaria.
* **Painel da Secretaria:** Triagem, revisão manual, aprovação/recusa de justificativas e encaminhamento aos professores das respectivas turmas.
* **Painel do Professor:** Visualização das faltas justificadas e atestados aprovados vinculados às suas turmas.
* **Console Admin (White-Label & Gestão):**
  * **Personalização White-Label:** Identidade visual da instituição e customização de cores da interface com prévia ao vivo.
  * **Gestão de Equipe:** Cadastro e gerenciamento de professores (com vínculo múltiplo de turmas) e secretários.
  * **Números de Suporte:** Configuração de canais de atendimento (WhatsApp/Telefone), horários e público-alvo.
  * **Uso e Telemetria:** Indicadores em tempo real de usuários ativos, distribuição por perfil, eventos recentes e exportação de relatórios CSV.

---

## 🏗️ Arquitetura do Repositório

```text
onclass/
├── back-end/          # API RESTful em NestJS + Prisma ORM + MongoDB Atlas + Swagger + OpenAI API
├── front-end/         # Aplicação SPA em Angular (Standalone Components) + White-Label Theme Engine
└── README.md          # Visão geral do projeto