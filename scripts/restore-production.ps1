# Restore FamilyDay GreenWorld production after scheduledTeardown took it offline (2026-07-17).
#
# scheduledTeardown does three things on 7/17 23:00:
#   1) Hosting SITE_DISABLE  2) remove allUsers run.invoker on api/apiLoadtest  3) pause dump scheduler.
# Re-deploying restores all three because:
#   - functions code declares invoker:"public" -> redeploy re-grants allUsers run.invoker
#   - redeploying the onSchedule dump function re-enables its Cloud Scheduler job
#   - deploying hosting creates a normal DEPLOY release that overrides SITE_DISABLE
# Firestore data is never touched by teardown, so nothing to restore there.
#
# Usage (from repo root):
#   .\scripts\restore-production.ps1

$ErrorActionPreference = "Stop"
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$backendDir = Join-Path $repoRoot "familyday-backend"

Write-Host "Restoring production (familyday-greenworld): functions + hosting redeploy"
Push-Location $backendDir
try {
    Write-Host "1/4 backend tsc build..."
    npm run build
    if (-not $?) { throw "backend build failed" }

    Write-Host "2/4 frontend production build (prod VITE_API_BASE)..."
    node ./scripts/build-frontend-for-hosting.mjs
    if (-not $?) { throw "frontend build failed" }

    Write-Host "3/4 sync hosting-dist..."
    node ./scripts/sync-hosting-dist.mjs
    if (-not $?) { throw "sync hosting-dist failed" }

    Write-Host "4/4 deploy functions (restores public invoker + dump schedule) + hosting (overrides SITE_DISABLE)..."
    npx firebase-tools deploy --only functions:api,functions:apiLoadtest,functions:dumpCheckinsDaily,hosting --project=production
    if (-not $?) { throw "firebase deploy failed" }

    Write-Host "Restore complete. Verify: open https://familyday-greenworld.web.app and curl the API health endpoint."
}
finally {
    Pop-Location
}
