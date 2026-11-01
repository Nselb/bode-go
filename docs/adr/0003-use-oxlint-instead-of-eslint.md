# ADR-0003: Use Oxlint instead of ESLint

- **Status:** Accepted
- **Date:** 2026-11-01
- **Deciders:** Mateo Alvear

## Context

In previous projects linting took a lot of time to run. This matters now
because the linter runs on every commit and in CI.
This project has two TypeScript applications and type-aware rules are required.
Angular CLI does not come with a default linter, so a linter must be chosen.

## Considered Options

1. **ESLint**: the standard choice with the largest ecosystem.
   - _Why not:_ It is slow, especially with type-aware rules.
2. **Oxlint**

## Decision

I will use Oxlint. Unlike ESLint, it is fast enough to run on every commit,
supports type-aware rules through `oxlint-tsgolint`, and ships built-in plugins
(TypeScript, unicorn, import, vitest) with a single root configuration.
Prettier remains the formatter.

## Consequences

### Positive

- It is fast enough to run on every commit without slowing down the workflow.
- A single configuration for the whole monorepo.

### Negative

- No equivalent to `angular-eslint`. Specific Angular rules and `.html` linting are lost.
- There are fewer rules and plugins than in the ESLint ecosystem.
- Type-aware linting depends on `tsgolint`, which is newer and less polished.

### Neutral / Follow-ups

- Revisit if Angular rules are missing. ESLint could execute in parallel
  only for them, and `eslint-plugin-oxlint` deactivates rules that overlap.
