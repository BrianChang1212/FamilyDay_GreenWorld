# FamilyDay Frontend

Frontend web app for FamilyDay GreenWorld activity.

## Setup

```bash
npm install
npm run dev
```

## Environment

- `VITE_API_BASE`: backend API base ending with `/api/v1`.
- `VITE_API_CONTRACT_VERSION`: consumed contract tag for release tracking.

See `.env.example` for defaults.

## Contract alignment

- Contract source-of-truth: `../familyday-api-contract`.
- Frontend releases should reference a tagged contract version.
