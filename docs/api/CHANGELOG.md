# API 契約變更紀錄（REST v0.1）

與 **`api-v0.1.md`** 一併在 **`docs/api/`** 維護。以下條目共通：若標示 **no REST contract change** 則僅文件／路徑／註記調整。

## [Unreleased]

- Docs: `api-v0.1.md` **v0.1.26** — §4 **`POST …/auth/login`** response example aligned with `familyday-backend/src/routes/auth.ts` (`ok`, `user`, `token`); **no REST contract change**.
- Docs: `api-v0.1.md` **v0.1.25** — auth narrative aligned with SPA **Bearer** + login **`token`** (cross-origin Hosting ↔ API); Cookie optional/compat; §13 sequence + MVP table; **no REST path change**.
- Docs (monorepo): remove **`familyday-api-contract/`** directory; contract governance text merged into **`docs/api/README.md`**; root **`.github/CODEOWNERS`** (was nested) for **`docs/api/*`**; no REST contract change.
- Docs (monorepo): move **`CHANGELOG.md`** from **`familyday-api-contract/`** to **`docs/api/CHANGELOG.md`** (unified **`docs/`** management); CI paths updated; **`CODEOWNERS`** entries now **`docs/api/api-v0.1.md`** · **`docs/api/CHANGELOG.md`**; no REST contract change.
- Docs (monorepo): REST spec text only **`docs/api/api-v0.1.md`**; **`familyday-api-contract/api-v0.1.md`** stub removed; CI paths updated; no REST contract change.
- Docs: `api-v0.1.md` v0.1.24 — MVP table notes for `admin/reports/*` aligned with `familyday-backend/src/routes/admin.ts`; no REST contract change.
- Docs: `api-v0.1.md` v0.1.23 — §11 Vitest sample path aligned to `familyday-frontend/src/api/`; no REST contract change.
- Docs: finish flow stays on `/finish`; `/finish/claimed` is redirect-only; table text for `POST …/reward/claim` updated accordingly. No REST contract change.
- Docs (monorepo): removed duplicate `docs/specs/api-v0.1.md`; API spec links in `docs/` now target this repo’s `api-v0.1.md` only. No REST contract change.

## [contract-v0.1.1] - 2026-05-11

- Docs: `api-v0.1.md` v0.1.22 — align mock path (`familyday-frontend/mock`) and backend MVP path (`familyday-backend/`) with monorepo layout; no REST contract change.

## [contract-v0.1.0] - 2026-05-05

- Bootstrap split repository from mono-repo `docs/specs/api-v0.1.md`.
- Add repository governance baseline (`README`, `CODEOWNERS`, contract CI).
