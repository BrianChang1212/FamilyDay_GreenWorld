param(
    [string]$JsonPath = "",
    [string]$OutputPath = ""
)

$ErrorActionPreference = "Stop"

function Get-ProjectRoot {
    $scriptDir = Split-Path -Parent $PSCommandPath
    return (Resolve-Path (Join-Path $scriptDir "..")).Path
}

function Resolve-InputJson {
    param(
        [string]$ProjectRoot,
        [string]$RequestedPath
    )

    if ($RequestedPath) {
        return (Resolve-Path $RequestedPath).Path
    }

    $dumpDir = Join-Path $ProjectRoot "ref_no_push\firestore-dumps"
    $latest = Get-ChildItem -Path $dumpDir -Filter "roster-*.json" -File |
        Where-Object { $_.Name -notmatch "name-employeeId" } |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1

    if (-not $latest) {
        throw "No roster JSON dump found under: $dumpDir"
    }

    return $latest.FullName
}

function Resolve-OutputTxt {
    param(
        [string]$JsonFullPath,
        [string]$RequestedPath
    )

    if ($RequestedPath) {
        return $RequestedPath
    }

    $dir = Split-Path -Parent $JsonFullPath
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($JsonFullPath)
    $suffix = $baseName -replace "^roster-", ""
    return (Join-Path $dir "roster-name-employeeId-$suffix.txt")
}

$projectRoot = Get-ProjectRoot
$jsonFullPath = Resolve-InputJson -ProjectRoot $projectRoot -RequestedPath $JsonPath
$txtPath = Resolve-OutputTxt -JsonFullPath $jsonFullPath -RequestedPath $OutputPath

$dump = Get-Content -Raw -Path $jsonFullPath | ConvertFrom-Json
if (-not $dump.docs) {
    throw "Input JSON does not contain a docs array: $jsonFullPath"
}

$lines = New-Object System.Collections.Generic.List[string]
$lines.Add("# Firestore Roster Export")
$lines.Add("# Source: $(Split-Path -Leaf $jsonFullPath)")
$lines.Add("# Format: No.  Employee ID  Name")
$lines.Add("")
$lines.Add("No.  Employee ID  Name")
$lines.Add("---  -----------  ----------------")

$index = 1
foreach ($doc in $dump.docs) {
    $employeeId = [string]$doc.employeeId
    $name = [string]$doc.name
    $lines.Add(("{0:D3}  {1,-11}  {2}" -f $index, $employeeId, $name))
    $index += 1
}

$outputDir = Split-Path -Parent $txtPath
if ($outputDir) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

$lines | Set-Content -Path $txtPath -Encoding UTF8

Write-Output "Input : $jsonFullPath"
Write-Output "Output: $txtPath"
Write-Output "Rows  : $($dump.docs.Count)"
