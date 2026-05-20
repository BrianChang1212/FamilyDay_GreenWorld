# API 契約變更紀錄（REST v0.1）

與 **`api-v0.1.md`** 一併在 **`docs/api/`** 維護。以下條目共通：若標示 **no REST contract change** 則僅文件／路徑／註記調整。

## [Unreleased]

- Docs (frontend behavior, no contract change): New `/reward` entry route + `entry-reward.png` QR. The route is a pure SPA dispatcher mirroring `/check-in` and `/game`: already-logged-in scanners go to `/finish`; unauthenticated scanners get `pendingFinish` written to sessionStorage and routed to `/register`, where RegisterView consumes the flag post-login and lands on `/finish`. `/scan` and `/reward` mutually clear each other's pending flag so the most recent scan wins. **No REST contract change.**
- Docs (frontend behavior, no contract change): ResultView post-correct-answer branching now distinguishes (a) first-clear (5/6 → 6/6 via this submit) → "闖關成功！領取闖關禮" → `/finish`; (b) replay-after-clear (already 6/6) → "回到關卡列表" → `/stage`; (c) partial progress → "前往下一關 >" → `/stage` (existing). Decision lives in pure helper `familyday-frontend/src/lib/resultAction.ts`. QuizView captures `completedStageIds.length` before/after submit and emits `?firstClear=1|0` on the result route. StageView adds a permanent "前往領取闖關禮" CTA below the progress list when `doneStageCount >= TOTAL_STAGES`. **No REST contract change.**
- Docs (architecture): `system-architecture.md` v1.5 — new §6.3 sequence for external QR scanner deep-link (`/scan?t=<JWT>` → `/quiz` or `/register`); shared payload parser in `familyday-frontend/src/lib/qrPayload.ts`. Staging station PNGs now encode `https://<host>/scan?t=<JWT>` (host overridable via `STAGING_QR_HOST`); embedded scanner accepts the same URL form. **No REST contract change.**
- Docs (architecture): `summary-frontend.md` §2.1 — `/scan` route added to routes table; `/register` row clarifies post-login routes to `/quiz?challengeId=cN` when `fdgw_pending_station_challenge` is set (external scan flow), otherwise to `/stage`. **No REST contract change.**
- Docs (frontend behavior, no contract change): `RegisterView.submit()` no longer calls `POST /api/v1/me/playthrough/restart` on login — full-clear (6/6) players retain `completedStageIds` and remain eligible for remaining reward slots (`claimFinishRewardProgress` still caps at `maxRewardRounds=3`). Partial-progress players also recover state via `GET /api/v1/me/dashboard`.
- Backend behavior change (server-side only, no REST contract change): `familyday-backend/src/state/game.ts::applyAttemptResult` drops the implicit stage-1 auto-reset path (was: `stage===1 && 6/6 && rewardRedeemCount>=bankedFullClears` → clear `completedStageIds`, `fullClearCount+=1`). Replay of any stage after full clear is now a no-op on progress arrays; the visual completion record is permanent. New regression test in `familyday-backend/test/state/game.test.ts` pins this. `/me/playthrough/restart` REST behavior is unchanged.
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
