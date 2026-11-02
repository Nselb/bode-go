# BodeGo

![CI](https://github.com/Nselb/bode-go/actions/workflows/ci.yml/badge.svg?branch=main)

Multi-warehouse inventory management for small businesses:
know how much stock you have, where it is, and who changed it.

> **Status:** work in progress. The current build has the project
> setup and a health check; inventory features are next.

## Documentation

- [Spec](docs/spec-en.md): problem, roles, domain model, business rules and flows.
- [Architecture Decision Records](docs/adr/README.md): why the project is built this way.

## Tech stack

| Layer    | Technology                                |
| -------- | ----------------------------------------- |
| Frontend | Angular 22                                |
| Backend  | NestJS 12                                 |
| Database | PostgreSQL 18                             |
| Tooling  | pnpm workspaces, Vitest, Oxlint, Prettier |
| Quality  | GitHub Actions, lefthook, commitlint      |

## Project structure

```
apps/
  api/    NestJS REST API
  web/    Angular frontend
docs/
  adr/    Architecture Decision Records
```

## Getting started

### Prerequisites

- Node.js 26 (see `.nvmrc`)
- pnpm (the exact version is downloaded automatically)
- Docker with Compose

### Setup

```bash
pnpm install
cp .env.example .env
docker compose up -d
pnpm dev
```

The API runs on http://localhost:3000 (health check: `/health/live`)
and the web app on http://localhost:4200.

## Scripts

| Command         | Description                   |
| --------------- | ----------------------------- |
| `pnpm dev`      | Run API and web in watch mode |
| `pnpm test`     | Unit tests                    |
| `pnpm test:e2e` | End-to-end tests              |
| `pnpm lint`     | Oxlint (type-aware)           |
| `pnpm format`   | Format with Prettier          |
| `pnpm build`    | Build all apps                |

## License

© 2026 Mateo Alvear. All rights reserved.
The source is public for review purposes; it may not be used,
copied or modified without permission.
