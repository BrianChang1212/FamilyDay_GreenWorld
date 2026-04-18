# Regenerate PNGs under docs/preview/screenshots/ (English comments only).
# Prerequisite: from repo root, run in source/: npm run build && npm run preview -- --host 127.0.0.1 --port 4173
# Then: powershell -File tool/capture-preview-screenshots.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$outDir = Join-Path $root "docs/preview/screenshots"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$base = "http://127.0.0.1:4173"
$viewport = "390,844"
$routes = @(
	@{ Path = "/"; File = "preview-welcome.png" },
	@{ Path = "/checkin"; File = "preview-checkin-form.png" },
	@{ Path = "/register"; File = "preview-register.png" },
	@{ Path = "/stage"; File = "preview-stage.png" }
)

Set-Location $root
foreach ($r in $routes) {
	$url = $base + $r.Path
	$dest = Join-Path $outDir $r.File
	npx --yes playwright@1.50.1 screenshot $url $dest --viewport-size=$viewport --full-page
	if ($LASTEXITCODE -ne 0) { throw "playwright failed for $($r.File)" }
}

Write-Host "Wrote screenshots to $outDir"
