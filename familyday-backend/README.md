# FamilyDay Backend

Firebase Functions backend for FamilyDay GreenWorld.

## Setup

```bash
npm install
npm run build
npm run serve
```

## Configuration

- `fdgw.project.json`: backend source-of-truth for project constants.
- `firebase.json` / `.firebaserc`: Firebase runtime and project mapping.
- `.env.example`: runtime flags and optional contract traceability.

## Contract alignment

- Contract source-of-truth: `../familyday-api-contract`.
- Backend release should pin the consumed contract tag.
