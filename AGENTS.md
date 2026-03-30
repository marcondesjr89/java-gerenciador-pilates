# Repository & Agent Guidelines: Gerenciador Pilates

## 1. Visao Geral do Produto
Sistema de gestao para studios de Pilates com foco em operacao interna, prontuario clinico, agenda, financeiro e portal do aluno.

- CRM e Clinico: anamnese estruturada, alertas clinicos, evolucao com anexos e prontuario consolidado.
- Agenda: slots por instrutor, reservas, cancelamentos, lista de espera, bloqueios e self-service no portal do aluno.
- Financeiro: planos, assinaturas, faturas, pagamentos, inadimplencia, DRE, comissoes e DMED.
- Comunicacao: notificacoes pendentes via outbox, com integracao externa ainda pendente.

## 2. Stack Tecnica e Ambiente
- Backend: Java 21, Spring Boot 3.4+, PostgreSQL, Redis e Flyway.
- Frontend: Next.js 15 App Router, Tailwind CSS e componentes internos.
- Ambiente local: Windows com PowerShell.

### Comandos principais
- `docker compose up -d postgres redis`
- `.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local`
- `.\mvnw.cmd test`
- `.\mvnw.cmd -Dmaven.repo.local=.m2 test`
- `cd frontend; npm run dev`
- `cd frontend; npm run lint`

### Observacao para agentes no sandbox
- Ao rodar Maven pelo Codex em ambiente sandbox, preferir `.\mvnw.cmd -Dmaven.repo.local=.m2 ...` para evitar falhas ao escrever em `C:\Users\CodexSandboxOffline\.m2\repository`.
- Se o sandbox ainda ignorar o repositorio local configurado e o comando for importante para validar a entrega, solicitar execucao escalada para os comandos Maven.

## 3. Estrutura do Projeto
- Backend modular em `src/main/java/br/com/gerenciadorpilates`
  - `identityaccess`
  - `students`
  - `clinical`
  - `scheduling`
  - `billing`
  - `reporting`
  - `notifications`
  - `platform`
- Frontend em `frontend/src`
- Documentacao arquitetural em `docs/architecture.md`

## 4. Workflow e Status Atual

### Concluido
- Fundacao do backend, perfis, seguranca JWT e bootstrap de admin.
- Cadastro e consulta de alunos.
- Prontuario clinico com anamnese, evolucao e anexos.
- Agenda operacional no backend: slots, reservas, cancelamentos, lista de espera, promocao automatica e bloqueios.
- Financeiro principal no backend: planos, assinaturas, faturas, pagamentos, inadimplencia, despesas, DRE, comissoes e DMED.
- KPIs no backend: churn, ocupacao e inadimplencia.
- Frontend interno com autenticacao real para administracao e recepcao.
- Dashboard interno consumindo KPIs reais.
- Agenda interna consumindo backend real.

### Parcialmente concluido
- Comunicacao: outbox pronto, integracao real com WhatsApp ainda pendente.
- Portal do aluno: backend pronto, frontend ainda nao iniciado.
- Agenda no frontend interno:
  - listagem de slots por dia
  - criacao de slots
  - reserva manual de aluno
  - consulta e cancelamento de reservas por slot
  - entrada e consulta de fila de espera
  - criacao de bloqueios
  - listagem de bloqueios do dia
  - edicao e remocao de bloqueios
  - protecao centralizada de `/agenda` no middleware

### Pendente
- Agenda no frontend:
  - refinamentos de UX apos mutacoes
- Modulo Alunos no frontend interno
- Modulo Financeiro no frontend interno
- Portal do aluno no frontend
- Interface dedicada do instrutor para tablet
- Integracoes externas de comunicacao
- Compliance e LGPD avancados
- Assinatura digital

## 5. Proxima Ordem Recomendada
1. Fechar agenda no frontend interno
2. Abrir modulo de alunos no frontend interno
3. Abrir financeiro interno
4. Construir portal do aluno
5. Integracoes externas finais

## 6. Regras de Operacao para IA
- Responder em Portugues do Brasil.
- Manter Java com 4 espacos e TypeScript/JSON com 2 espacos.
- Ao alterar comportamento relevante, sugerir validacao por testes ou lint.
- Nao colocar segredos no codigo.
- Ao trabalhar no frontend, preservar a identidade visual ja estabelecida no projeto.
