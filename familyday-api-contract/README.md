# FamilyDay API Contract Repository

This repository is the source-of-truth for API contracts shared by frontend
and backend teams.

## Scope

- API specifications and version history.
- Contract governance and review rules.
- Contract CI checks.

## Current contract assets

- `api-v0.1.md`: current API contract baseline migrated from mono-repo.

## Versioning

- Use semantic tags: `contract-vMAJOR.MINOR.PATCH`.
- Breaking response/request changes require MAJOR bump.
- Backward-compatible additions require MINOR bump.
- Documentation-only or typo fixes use PATCH bump.

## Release process

1. Update contract files.
2. Update `CHANGELOG.md`.
3. Open PR with both frontend/backend reviewers.
4. Merge and create a `contract-v*` tag.
