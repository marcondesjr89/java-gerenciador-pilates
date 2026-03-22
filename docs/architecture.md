# Arquitetura Base

## Direcao

O sistema segue o estilo de `monolito modular`.
Cada modulo concentra seu proprio fluxo de negocio, mas compartilha a mesma aplicacao, banco e pipeline de deploy.

## Modulos iniciais

- `identityaccess`: autenticacao, autorizacao e perfis.
- `students`: cadastro e ciclo de vida do aluno.
- `clinical`: anamnese, alertas clinicos e evolucao.
- `scheduling`: agenda, instrutores e conflitos.
- `billing`: mensalidades, recebimentos e inadimplencia.
- `reporting`: KPIs, relatorios e DMED.
- `notifications`: comunicacao e adaptadores externos.
- `platform`: configuracao, seguranca, auditoria e componentes compartilhados.

## Organizacao de codigo

Cada modulo deve evoluir preferencialmente nestas camadas:

- `api`: controllers e DTOs de entrada e saida.
- `application`: casos de uso e servicos de aplicacao.
- `domain`: regras de negocio e contratos do modulo.
- `infrastructure`: persistencia, integracoes e detalhes tecnicos.

## Ambientes

- `local`: usa Docker Compose para PostgreSQL e Redis.
- `test`: isolado para testes e pipelines.
- `prod`: preparado para rodar em Docker ou como `java -jar` em VM/VPS.

## Regras de infraestrutura

- Aplicacao stateless.
- Configuracao por variaveis de ambiente.
- Arquivos fora do container ou em storage dedicado.
- Logs em stdout para facilitar container e systemd.
- Banco e cache desacoplados da aplicacao.
