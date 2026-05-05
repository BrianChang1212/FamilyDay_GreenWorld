# FamilyDay Repo Split Migration

This mono-repo has been split into three independent repositories to support
separate frontend/backend team schedules and release cadences.

## New repositories

- `familyday-frontend`: frontend runtime and tests.
- `familyday-backend`: Firebase Functions backend runtime.
- `familyday-api-contract`: API contract source-of-truth and governance.

## Current local layout

- `20260410_FamilyDay_GreenWorld_App/familyday-frontend`
- `20260410_FamilyDay_GreenWorld_App/familyday-backend`
- `20260410_FamilyDay_GreenWorld_App/familyday-api-contract`

## Content mapping

- Old `source/**` -> `familyday-frontend`
- Old `functions/**` + root Firebase config -> `familyday-backend`
- Old `docs/specs/api-v0.1.md` -> `familyday-api-contract/api-v0.1.md`

## Cutover rules

- New development should happen in split repositories.
- This mono-repo is kept for historical traceability.
- Contract changes must be released from `familyday-api-contract` first, then
  consumed by frontend/backend release branches.
- Legacy folders in root (`source/`, `functions/`) are read-only historical
  references and should not receive new feature development.

## Repository URLs

<!-- TODO: Fill in remote URLs for the three split repositories -->
