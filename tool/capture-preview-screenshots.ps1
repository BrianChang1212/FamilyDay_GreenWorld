# Regenerate PNGs under docs/preview/screenshots/ (English comments only).
# Prerequisite: cd familyday-frontend && npm run build && npm run preview -- --host 127.0.0.1 --port 4173
# Then: powershell -File tool/capture-preview-screenshots.ps1
#
# Welcome: set $false to keep a hand-placed design hero at preview-welcome.png
# (other routes are always captured from the running app).

$CaptureWelcomeFromApp = $true

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$outDir = Join-Path $root "docs/preview/screenshots"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

# Optional override if preview bound another port (e.g. 4173 in use):
#   $env:FDGW_PREVIEW_BASE = "http://127.0.0.1:4174"
$base = if ($env:FDGW_PREVIEW_BASE) { $env:FDGW_PREVIEW_BASE } else { "http://127.0.0.1:4173" }
$viewport = "390,844"
$routes = @(
	@{ Path = "/"; File = "preview-welcome.png" },
	@{ Path = "/checkin"; File = "preview-checkin-form.png" },
	@{ Path = "/register"; File = "preview-register.png" },
	@{ Path = "/stage"; File = "preview-stage.png" },
	@{ Path = "/finish"; File = "preview-finish.png" }
)

Set-Location $root
Write-Host "Preview base: $base"
foreach ($r in $routes) {
	if (-not $CaptureWelcomeFromApp -and $r.File -eq "preview-welcome.png") {
		Write-Host "Skip $($r.File) (design hero; set `$CaptureWelcomeFromApp = `$true to capture from app)"
		continue
	}
	$url = $base + $r.Path
	$dest = Join-Path $outDir $r.File
	npx --yes playwright@1.51.0 screenshot $url $dest --viewport-size=$viewport --full-page
	if ($LASTEXITCODE -ne 0) { throw "playwright failed for $($r.File)" }
}

Write-Host "Wrote screenshots to $outDir"
