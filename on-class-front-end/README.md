# 🎓 Sistema de Gestão de Abono de Faltas — Frontend

Aplicação web desenvolvida em **Angular** para a gestão e automação do processo de solicitação, triagem e validação de abono de faltas e segunda chamada acadêmica.

---

## 🚀 Sobre o Projeto

O sistema foi desenhado para conectar três atores fundamentais no ambiente educacional:
1. **Aluno:** Solicita abonos anexando atestados/comprovantes ou através de formulários diretos e acompanha o estado do pedido em tempo real.
2. **Secretaria:** Efetua a triagem inicial das solicitações com auxílio de leitura inteligente por IA e faz o encaminhamento ao corpo docente.
3. **Professor:** Avalia as solicitações encaminhadas pela secretaria, visualiza os dias de afastamento/faltas pendentes e regista o parecer final com um clique.

---

## 🛠️ Tecnologias Utilizadas

- **Framework:** Angular (Standalone Components)
- **Linguagem:** TypeScript
- **Estilização:** CSS3 puro / Design Responsivo
- **Roteamento:** Angular Router (Rotas Dinâmicas)
- **Comunicação:** RxJS / HttpClient

---

## 💻 Funcionalidades Principais

- **Dashboard do Aluno:** Envio de atestados, acompanhamento de estado em tempo real.
- **Painel da Secretaria (`solicitacoesS`):** Triagem inteligente, verificação de dados acadêmicos e encaminhamento aos docentes.
- **Dashboard do Professor (`dashboardP`):** Listagem restrita às 5 solicitações mais recentes encaminhadas e aceitas pela secretaria.
- **Layout Dual (`solicitacoesP`):** Alternância automática entre o relatório de análise inteligente por IA (para anexos) e visualização de dados acadêmicos com contador de **dias de afastamento / faltas a abonar**.

---

## ⚙️ Como Executar o Projeto

### Pré-requisitos
- **Node.js**: v18.x ou superior
- **npm**: v9.x ou superior
- **Angular CLI**: v17.x ou superior

### Passos para Instalação

1. **Clonar o repositório:**
   ```bash
   git clone [https://github.com/seu-usuario/seu-repositorio.git](https://github.com/seu-usuario/seu-repositorio.git)
   cd on-class-front-end