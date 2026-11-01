# ADR-0002: Use a monorepo with pnpm workspaces

- **Status:** Accepted
- **Date:** 2026-11-01
- **Deciders:** Mateo Alvear

## Context

The project has two applications: a web frontend (Angular) and an API (NestJS),
both written in TypeScript on Node.js. They share tooling (linting, formatting,
commit hooks, CI) and may share code in the future (e.g. types/DTOs).
It is developed by a single person.

## Considered Options

1. **Separate repositories**
   - _Why not:_ Requires duplicating tooling and CI, and a change that touches
     both apps requires two coordinated PRs.
1. **Nx monorepo**
   - _Why not:_ Nx adds its own setup layer, plugins, and generators over
     Angular CLI and Nest CLI and has a high learning curve.
     For a project with two packages its benefits (cache, affected builds)
     are negligible.
1. **Turborepo**
   - _Why not:_ Adds another dependency and its setup to get task caching,
     which is not noticeable with two apps.
1. **pnpm workspaces**

## Decision

I will use a monorepo managed with pnpm workspaces. Unlike separate repositories,
tooling and CI are set up once and cross-app changes go in a single PR.
Unlike Nx or Turborepo, it requires no additional tool:
pnpm is already the package manager, and features like `pnpm -r` and catalogs
cover the project's current needs.

## Consequences

### Positive

- One repository to maintain.
- Tooling is set up only once (lint, format, commit hooks, CI).
- Shared dependency versions align with pnpm catalogs.
- Changes that touch frontend and API go in one PR.

### Negative

- No task caching or affected builds; CI always executes everything.
- Both apps share the same pipeline and Node.js version.

### Neutral / Follow-ups

- Revisit if build or CI times grow. Turborepo runs on top of pnpm
  workspaces, so adopting it means adding a tool, not restructuring
  the project.
