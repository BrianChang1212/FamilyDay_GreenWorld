# One-shot local dev: install deps, ensure .env.local, start Functions emulator (cloud Firestore), then Vite.
# Usage:
#   .\scripts\dev-oneclick.ps1 -CredentialPath "D:\secrets\your-sa.json"
#   # or set GOOGLE_APPLICATION_CREDENTIALS first, then:
#   .\scripts\dev-oneclick.ps1
#
# Prerequisites: Node.js 20+, repo cloned, fdgw.project.json + familyday-backend/.firebaserc aligned for your Firebase project.
Param(
	[string]$CredentialPath = $env:GOOGLE_APPLICATION_CREDENTIALS,
	[switch]$SkipInstall
)

$ErrorActionPreference = "Stop"
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$backendDir = Join-Path $repoRoot "familyday-backend"
$frontendDir = Join-Path $repoRoot "familyday-frontend"
$fdgwPath = Join-Path $repoRoot "fdgw.project.json"

if (-not (Test-Path $fdgwPath)) {
	Write-Error "Missing fdgw.project.json at repo root."
}

if (-not $CredentialPath -or -not (Test-Path -LiteralPath $CredentialPath)) {
	Write-Error @"
Missing service account JSON. Either:
  - Pass -CredentialPath 'D:\path\to\key.json'
  - Or set environment variable GOOGLE_APPLICATION_CREDENTIALS to that path
Do NOT commit the key file to Git.
"@
}

# Default encoding breaks UTF-8 JSON (Chinese in fdgw.project.json).
$cfg = Get-Content -LiteralPath $fdgwPath -Raw -Encoding UTF8 | ConvertFrom-Json
$projectId = $cfg.firebaseProjectId
$region = $cfg.functionsRegion
$funcName = $cfg.httpsFunctionName
$emuHost = $cfg.functionsEmulatorHost
$emuPort = [int]$cfg.functionsEmulatorPort
# Emulator path: /{project}/{region}/{functionId}/api/v1 (function export name is e.g. "api").
$healthUrl = "http://${emuHost}:${emuPort}/${projectId}/${region}/${funcName}/api/v1/health"

Write-Host "Repo: $repoRoot"
Write-Host "Health probe: $healthUrl"

if (-not $SkipInstall) {
	Write-Host "npm install (familyday-frontend)..."
	Push-Location $frontendDir
	npm install
	Pop-Location
	Write-Host "npm install (familyday-backend)..."
	Push-Location $backendDir
	npm install
	Pop-Location
}

$envLocal = Join-Path $frontendDir ".env.local"
$needEnv = $true
if (Test-Path $envLocal) {
	$existing = Get-Content $envLocal -Raw
	if ($existing -match '(?m)^\s*VITE_API_BASE\s*=') { $needEnv = $false }
}
if ($needEnv) {
	$line = "VITE_API_BASE=/fdgw-emulator-api"
	if (Test-Path $envLocal) {
		Add-Content -Path $envLocal -Value "`n$line"
		Write-Host "Appended to familyday-frontend/.env.local: $line"
	} else {
		Set-Content -Path $envLocal -Value "$line`n"
		Write-Host "Created familyday-frontend/.env.local with $line"
	}
}

$ps1 = Join-Path $backendDir "scripts\cloud-firestore-dev.ps1"
Write-Host "Starting Functions emulator + cloud Firestore (background job)..."
$job = Start-Job -ScriptBlock {
	param($Root, $Cred)
	Set-Location (Join-Path $Root "familyday-backend")
	& powershell.exe -ExecutionPolicy Bypass -NoProfile -File ".\scripts\cloud-firestore-dev.ps1" `
		-Mode serve -CredentialPath $Cred -FunctionsOnly
} -ArgumentList @($repoRoot, $CredentialPath)

$ok = $false
$deadline = (Get-Date).AddSeconds(120)
while ((Get-Date) -lt $deadline) {
	if ($job.State -eq "Failed") {
		Receive-Job $job
		Remove-Job $job -Force -ErrorAction SilentlyContinue
		Write-Error "Emulator job failed (see messages above)."
	}
	try {
		$r = Invoke-WebRequest -Uri $healthUrl -UseBasicParsing -TimeoutSec 3
		if ($r.StatusCode -eq 200) {
			$ok = $true
			break
		}
	} catch {
		Start-Sleep -Seconds 2
	}
}

if (-not $ok) {
	Receive-Job $job -ErrorAction SilentlyContinue | Write-Host
	Stop-Job $job -ErrorAction SilentlyContinue
	Remove-Job $job -Force -ErrorAction SilentlyContinue
	Write-Error "Emulator did not become ready within 120s. Check port $emuPort (not in use?) and credentials/IAM."
}

Write-Host "Emulator OK. Starting Vite (Ctrl+C stops frontend only; run Stop-Job -Id $($job.Id) to stop emulator)."
try {
	Push-Location $frontendDir
	npm run dev
} finally {
	Stop-Job $job -ErrorAction SilentlyContinue
	Remove-Job $job -Force -ErrorAction SilentlyContinue
	Write-Host "Stopped emulator background job."
}
