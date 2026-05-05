# FamilyDay Repo Split Boundary

## Target repositories

- `familyday-frontend`: keep only frontend runtime and frontend tests.
- `familyday-backend`: keep only Firebase Functions runtime and backend scripts.
- `familyday-api-contract`: keep API contract sources and contract governance files.

## File mapping

### familyday-frontend

- `source/**`
- frontend-specific workflow converted from `.github/workflows/ci.yml`
- frontend `README.md`, `.gitignore`, `.env.example`

### familyday-backend

- `functions/**`
- backend config files:
  - `firebase.json`
  - `.firebaserc`
  - `fdgw.project.json`
  - `firestore.rules`
  - `firestore.indexes.json`
- backend `README.md`, `.gitignore`, `.env.example`

### familyday-api-contract

- `docs/specs/api-v0.1.md` (first contract seed)
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
