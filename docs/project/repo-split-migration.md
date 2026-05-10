# FamilyDay Repo Split (Migration & Boundary)

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

## Historical content mapping (pre-split)

- Old `source/**` -> `familyday-frontend`
- Old `functions/**` + root Firebase config -> `familyday-backend`
- Old `docs/specs/api-v0.1.md` -> `familyday-api-contract/api-v0.1.md` (mono-repo
  copy removed; contract file is the only maintained source)

## Target file mapping (split output)

### familyday-frontend

- `source/**` (historical name; live tree is `familyday-frontend/**`)
- frontend-specific workflow converted from `.github/workflows/ci.yml`
- frontend `README.md`, `.gitignore`, `.env.example`

### familyday-backend

- `functions/**` (live tree under `familyday-backend/functions/**`)
- backend config files:
  - `firebase.json`
  - `.firebaserc`
  - `fdgw.project.json`
  - `firestore.rules`
  - `firestore.indexes.json`
- backend `README.md`, `.gitignore`, `.env.example`

### familyday-api-contract

- `api-v0.1.md` (REST contract baseline)
- contract governance files:
  - `README.md`
  - `CHANGELOG.md`
  - `CODEOWNERS`
  - contract CI workflow

## Exclusions for split output

Never migrate generated/build/local cache content:

- `**/node_modules/**`
- `source/dist/**`
- `functions/lib/**`
- `*.log`
- `.env*` (except template files such as `.env.example`)

## Cross-repo integration rules

- Frontend consumes backend via `VITE_API_BASE`, not mono-repo paths.
- Backend keeps `fdgw.project.json` as source-of-truth for deployment project identity.
- API contract changes are versioned in `familyday-api-contract` and consumed by both repos.

## Cutover rules

- New development should happen in split repositories.
- This mono-repo is kept for historical traceability.
- Contract changes must be released from `familyday-api-contract` first, then
  consumed by frontend/backend release branches.
- Legacy folders in root (`source/`, `functions/`) are read-only historical
  references and should not receive new feature development.

## Repository URLs

<!-- TODO: Fill in remote URLs for the three split repositories -->
