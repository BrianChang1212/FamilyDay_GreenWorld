# FamilyDay Frontend

Frontend web app for FamilyDay GreenWorld activity.

## Setup

```bash
npm install
npm run dev
```

## Environment

- `VITE_API_BASE`: API **host root** (no trailing `/`); the app calls `${VITE_API_BASE}/api/v1/...` (see `src/api/gameFlow.ts`).
- `VITE_API_CONTRACT_VERSION`: consumed contract tag for release tracking.

See `.env.example` for defaults.

## Contract alignment

- Contract: `../../docs/api/api-v0.1.md` · Changelog: `../../docs/api/CHANGELOG.md` · Release notes / tags: [`../../docs/api/README.md`](../../docs/api/README.md) · CODEOWNERS: `../../.github/CODEOWNERS`.
- Frontend releases should reference a tagged contract version.
