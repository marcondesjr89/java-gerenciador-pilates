# Gerenciador Pilates

Base inicial do sistema de gestao para studio de pilates.

## Stack

- Java 21
- Spring Boot 3.4
- PostgreSQL
- Redis
- Flyway
- Docker

## Perfis

- `local`: desenvolvimento local com Docker Compose.
- `test`: testes automatizados.
- `prod`: execucao em container, VM ou VPS.

## Estrutura

- `src/main/java/br/com/gerenciadorpilates`: codigo fonte.
- `src/main/resources`: configuracoes, migrations e mensagens.
- `infra/docker`: arquivos auxiliares de infraestrutura.
- `docs`: decisoes e guias de arquitetura.

## Como rodar localmente

1. Suba as dependencias:
   `docker compose up -d postgres redis`
2. Execute a aplicacao com Java 21:
   `.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local`

## Comandos principais

- Backend local: `.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local`
- Testes backend: `.\mvnw.cmd test`
- Testes backend com repositorio Maven no workspace: `.\mvnw.cmd "-Dmaven.repo.local=.m2" test`
- Frontend local: `cd frontend; npm run dev`
- Lint frontend: `cd frontend; npm run lint`

## Maven e `.m2`

- O projeto pode manter uma pasta `.m2/` no workspace como repositorio Maven local para ambientes restritos.
- Essa pasta deve permanecer fora do versionamento e ja esta coberta pelo `.gitignore`.
- Em uso local normal, o Maven pode usar o repositorio padrao do usuario.
- Em PowerShell com sandbox ou automacao por agente, prefira `.\mvnw.cmd "-Dmaven.repo.local=.m2" ...` para evitar falhas de escrita no repositorio padrao do sistema.
