# 💻 OnClass — Front-end Web (Angular)

Interface web da plataforma **OnClass**, estruturada com componentes *standalone* do Angular, motor dinâmico de temas **White-Label** via variáveis CSS e painéis dedicados para **Aluno**, **Secretaria**, **Professor** e **Administrador**.

---

## 🚀 Tecnologias Utilizadas

* **Framework:** [Angular](https://angular.dev/) (Standalone Components & Reactive/Template-driven Forms)
* **Linguagem:** TypeScript, HTML5 e CSS3 moderno (Grid, Flexbox e CSS Custom Properties)
* **Programação Reativa:** RxJS (`Observable`, `HttpClient` com autenticação JWT via `Authorization: Bearer`)
* **Arquitetura White-Label:** `ThemeService` + `PreviewDeviceComponent` com sincronização ao vivo em `iframe`

---

## 📂 Estrutura de Pastas (`src/app/`)

```text
src/app/
├── admin-console/         # Console Admin (Personalização White-Label, Equipe, Números de Suporte e Telemetria)
├── auth/                  # Tela de Login e redirecionamento por perfil
├── core/
│   ├── guards/            # Proteção de rotas autenticadas
│   └── services/          # Serviços HTTP (AdminApiService, NotificacoesService, ThemeService)
├── dashboard-aluno/       # Portal do Aluno / Responsável, envio de justificativas e Central de Ajuda
├── dashboard-professor/   # Painel de acompanhamento docente por turma
└── dashboard-secretaria/  # Triagem, revisão manual e visualização do laudo gerado pela OpenAI

<!-- Pré-Requisitos da Maquina -->
npm install -g @angular/cli

<!-- Como configurar e executar na sua maquina -->
INSTALAR DEPENDENCIAS DO PROJETO
npm install
INICIAR O SERVIDOR DE DESENVOLVIMENTO
ng serve