# GestãoTCC Pro

Plataforma completa para gestão de Trabalhos de Conclusão de Curso (TCC) — organiza o fluxo entre alunos, orientadores/professores e coordenação: temas, entregas, cronograma, agendas, avaliação final e notificações.

Este repositório é um monorepo com dois projetos independentes:

```
gestao-tcc-pro/
  api-tcc-pro/   # Backend — API REST (AdonisJS + PostgreSQL)
  frontend/      # Frontend — SPA (React + Vite)
  design/        # Referências visuais (telas em .png) usadas no frontend
```

O frontend tem seu próprio README com instruções detalhadas de setup, scripts e convenções:

- [`frontend/README.md`](frontend/README.md) — frontend

> O backend (`api-tcc-pro/`) ainda não tem README próprio; as instruções mínimas de setup estão abaixo.

## Visão geral

- **Perfis de acesso**: Aluno, Professor/Orientador, Coordenação
- **Módulos principais**: autenticação, tema de TCC, agenda/cronograma, avaliação final, dashboards por perfil, notificações
- **Autenticação**: planejada via OAuth2 (Google) — o frontend envia o token de sessão e o backend valida via middleware (ainda desabilitado enquanto o frontend não está pronto)

## Como rodar o projeto localmente

1. **Backend** (`api-tcc-pro/`)
   ```bash
   cd api-tcc-pro
   npm install
   # configurar .env (ver README do backend)
   npm run dev
   ```
   Sobe em `http://127.0.0.1:3333`. Documentação interativa da API (Swagger) em `http://127.0.0.1:3333/tcc-pro/swagger`.

2. **Frontend** (`frontend/`)
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   npm run dev
   ```
   Sobe em `http://localhost:5173` e já aponta para o backend acima via `VITE_API_URL`.

## Design

As telas de referência (login, dashboards de aluno/professor/coordenação, fluxos de tema e avaliação de TCC) ficam em [`design/`](design/) e orientam a implementação do frontend, incluindo a evolução da UI para uma convenção de Atomic Design (ver seção correspondente no README do frontend).

## Branches

- `main` — branch estável/integração
- `frontend` — desenvolvimento do frontend

## Documentação adicional

- [`api-tcc-pro/DIAGRAMA_CLASSES.md`](api-tcc-pro/DIAGRAMA_CLASSES.md) — diagrama de classes do domínio do backend
