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

- Contract source-of-truth: `../familyday-api-contract`.
- Frontend releases should reference a tagged contract version.
