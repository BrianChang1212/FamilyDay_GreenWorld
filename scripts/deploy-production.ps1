# One-click production release: frontend prod build (via fdgw API base) + backend tsc + Firebase Hosting + Functions + Firestore.
# Prerequisite: `firebase login` and correct `.firebaserc` / `familyday-backend/.env.<projectId>` for deploy.
#
# Usage (from repo root):
#   .\scripts\deploy-production.ps1
#   .\scripts\deploy-production.ps1 -Install          # npm install in frontend + backend first
#   .\scripts\deploy-production.ps1 -RunTests       # run familyday-frontend Vitest before deploy
#   .\scripts\deploy-production.ps1 -Install -RunTests

Param(
	[switch]$Install,
	[switch]$RunTests
)

$ErrorActionPreference = "Stop"
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$backendDir = Join-Path $repoRoot "familyday-backend"
$frontendDir = Join-Path $repoRoot "familyday-frontend"

Write-Host "Repo root: $repoRoot"
Write-Host "Deploy pipeline: backend tsc -> frontend vite build (productionApi) -> firebase deploy (hosting,functions:api,firestore)"

if ($Install) {
	Write-Host "npm install (familyday-frontend)..."
	Push-Location $frontendDir
	npm install
	Pop-Location
	Write-Host "npm install (familyday-backend)..."
	Push-Location $backendDir
	npm install
	Pop-Location
}

if ($RunTests) {
	Write-Host "npm run test (familyday-frontend)..."
	Push-Location $frontendDir
	npm run test
	Pop-Location
}

Write-Host "npm run deploy:app (familyday-backend)..."
Push-Location $backendDir
npm run deploy:app
Pop-Location

Write-Host "Done."
