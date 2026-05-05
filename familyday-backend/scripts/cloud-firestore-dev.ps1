# Cloud Firestore dev: sets env and runs build + serve|verify|all.
# Default Firebase project id: repo root fdgw.project.json (keep .firebaserc in sync).
# Example (service account JSON must NOT be committed; path is machine-specific):
#   .\cloud-firestore-dev.ps1 -Mode verify -CredentialPath "D:\Brian\secrets\your-sa.json"
# Or set GOOGLE_APPLICATION_CREDENTIALS before npm run verify:firestore — see root README "GCP 服務帳戶" and docs/architecture/summary-backend.md §2.0.
# -FunctionsOnly: firebase emulators:start --only functions (no Hosting on 5000; use with Vite dev server).
Param(
	[ValidateSet("serve", "verify", "all")]
	[string]$Mode = "serve",
	[string]$ProjectId,
	[string]$CredentialPath,
	[string]$DatabaseId,
	# Vite serves the SPA; skip Hosting emulator to avoid port 5000 conflicts.
	[switch]$FunctionsOnly
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$fdgwPath = Join-Path $repoRoot "fdgw.project.json"
$fdgwProjectId = $null
if (Test-Path $fdgwPath) {
	$fdgwProjectId = (Get-Content -LiteralPath $fdgwPath -Raw -Encoding UTF8 | ConvertFrom-Json).firebaseProjectId
}
if (-not $fdgwProjectId) {
	$fdgwProjectId = "rare-lattice-495009-i9"
}

$projectId =
	if ($ProjectId) { $ProjectId }
	elseif ($env:GOOGLE_CLOUD_PROJECT) { $env:GOOGLE_CLOUD_PROJECT }
	else { $fdgwProjectId }

$credentialPath =
	if ($CredentialPath) { $CredentialPath }
	elseif ($env:GOOGLE_APPLICATION_CREDENTIALS) { $env:GOOGLE_APPLICATION_CREDENTIALS }
	else { "" }

$databaseId =
	if ($DatabaseId) { $DatabaseId }
	elseif ($env:FDGW_FIRESTORE_DATABASE_ID) { $env:FDGW_FIRESTORE_DATABASE_ID }
	else { "default" }

if (-not $credentialPath) {
	Write-Error "Missing credential path. Pass -CredentialPath or set GOOGLE_APPLICATION_CREDENTIALS."
}

if (-not (Test-Path $credentialPath)) {
	Write-Error "Credential file not found: $credentialPath"
}

$env:FDGW_USE_FIRESTORE = "true"
$env:GOOGLE_CLOUD_PROJECT = $projectId
$env:GOOGLE_APPLICATION_CREDENTIALS = $credentialPath
$env:FDGW_FIRESTORE_DATABASE_ID = $databaseId

if (Test-Path Env:FIRESTORE_EMULATOR_HOST) {
	Remove-Item Env:FIRESTORE_EMULATOR_HOST
}

Write-Host "Configured cloud Firestore environment:"
Write-Host "  GOOGLE_CLOUD_PROJECT=$projectId"
Write-Host "  FDGW_FIRESTORE_DATABASE_ID=$databaseId"
Write-Host "  GOOGLE_APPLICATION_CREDENTIALS=$credentialPath"

npm run build

if ($Mode -eq "verify") {
	npm run verify:firestore
	exit $LASTEXITCODE
}

if ($Mode -eq "all") {
	$serveJob = Start-Job -ScriptBlock {
		Param($workdir, $fnOnly)
		Set-Location $workdir
		if ($fnOnly) { npm run serve:functions } else { npm run serve }
	} -ArgumentList (Get-Location).Path, $FunctionsOnly

	Start-Sleep -Seconds 5
	npm run verify:firestore
	$verifyCode = $LASTEXITCODE

	Write-Host "Stopping emulator background job..."
	Stop-Job $serveJob -ErrorAction SilentlyContinue
	Remove-Job $serveJob -ErrorAction SilentlyContinue

	exit $verifyCode
}

if ($FunctionsOnly) {
	npm run serve:functions
} else {
	npm run serve
}
