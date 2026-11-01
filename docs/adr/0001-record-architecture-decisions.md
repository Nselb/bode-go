# ADR-0001: Record architecture decisions

- **Status:** Accepted
- **Date:** 2026-11-01
- **Deciders:** Mateo Alvear

## Context

I need to document the rationale behind each technical decision I make
in order to help me and others understand why a decision was made.

## Considered Options

1. **No formal record (commit messages and PR descriptions)**
   - _Why not:_ Reasoning gets scattered, there is no single place to read "why X"
     and commits explain what changed, not why.
2. **External notes (Obsidian/Notion)**
   - _Why not:_ Even though it is still markdown, it lives outside the repo.
     It is not versioned with the code, not reviewed through PRs and invisible
     to anyone reviewing the project.
3. **Design section in the [spec](../spec-en.md)**
   - _Why not:_ A single document with all decisions will be hard to read and can
     be edited by mistake.
4. **In-repo ADRs (Nygard format)**

## Decision

I will use ADRs in Nygard format, extended with a Considered Options section,
stored in `docs/adr/` and numbered sequentially. Unlike commit messages,
they give each decision a single place; unlike external notes,
they are versioned with the code and reviewed in PRs; unlike a spec section,
they are more readable and preserve history because accepted ADRs are immutable.

## Consequences

### Positive

- Every decision is recorded along with its context
  and the alternatives considered.
- Anyone (including future me) can understand why the
  system is the way it is without digging through code or git history.

### Negative

- Adds overhead: each significant decision requires writing an ADR.
- Requires discipline; if ADRs stop being written, the record
  becomes incomplete and misleading.

### Neutral / Follow-ups

- Define what counts as a "significant" decision to avoid documenting trivia.
- Accepted ADRs cannot be edited;
  changes are made with new ADRs that supersede them.
