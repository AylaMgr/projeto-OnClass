# 🎓 OnClass - Front-end (Angular)

Interface web da plataforma **OnClass**, desenvolvida para a gestão e triagem automatizada de atestados médicos e justificativas escolares com auxílio de Inteligência Artificial.

---

## 🚀 Tecnologias Utilizadas

- **Framework:** Angular 17+ (Componentes Standalone)
- **Linguagem:** TypeScript
- **Estilização:** CSS3 puro com variáveis personalizadas
- **Roteamento:** Angular Router
- **Reatividade:** RxJS

---

## 📋 Funcionalidades Principais

### 🏛️ Painel da Secretaria (`/secretaria/dashboard` & `/secretaria/analises-manuais`)
- **Dashboard de Gestão:** Indicadores de KPI em tempo real (Total de justificativas, pendentes, aprovadas e recusadas), gráfico de frequência semanal e distribuição de motivos de ausência.
- **Análises Manuais:** Interface para a secretaria revisar apenas as solicitações que demandam atenção humana (ex: faltas sem formulário padronizado ou justificativas indeferidas).
- **Badging Dinâmico de Status:**
  - 🟢 **Concluído:** Atestados válidos processados e aprovados automaticamente pela IA OnClass (`#d1fae5`).
  - 🟡 **Pendente:** Justificativas que aguardam análise manual da secretaria (`#fef3c7`).
  - 🔴 **Rejeitado:** Solicitações recusadas ou indeferidas (`#fee2e2`).
- **Modal de Detalhes:** Visualização completa da linha do tempo e documento enviado.
- **Filtros Avançados:** Busca por aluno, matrícula, turno e turma.

---

## 🛠️ Configuração e Execução

### Pré-requisitos
- Node.js (`>= 18.x`)
- npm (`>= 9.x`) ou yarn

### Passos para Rodar

1. **Instalar dependências:**
   ```bash
   npm install