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
2. Execute a aplicacao com seu Java 21:
   `mvn spring-boot:run -Dspring-boot.run.profiles=local`

No futuro, quando adicionarmos o Maven Wrapper, o comando passa a ser `./mvnw`.
