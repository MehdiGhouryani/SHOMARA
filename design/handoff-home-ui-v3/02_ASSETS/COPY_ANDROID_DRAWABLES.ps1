param([Parameter(Mandatory=$false)][string]$RepoRoot = (Get-Location).Path)
$src = Join-Path $PSScriptRoot 'android/drawable'
$dst = Join-Path $RepoRoot 'apps/android/core/designsystem/src/main/res/drawable'
if (-not (Test-Path (Join-Path $RepoRoot 'apps/android/core/designsystem'))) {
  throw "SHOMARA repository root not found: $RepoRoot"
}
New-Item -ItemType Directory -Force -Path $dst | Out-Null
Get-ChildItem -Path $src -Filter '*.xml' -File | ForEach-Object {
  $target = Join-Path $dst $_.Name
  if (Test-Path $target) {
    $sourceHash = (Get-FileHash $_.FullName -Algorithm SHA256).Hash
    $targetHash = (Get-FileHash $target -Algorithm SHA256).Hash
    if ($sourceHash -ne $targetHash) { throw "Resource name conflict: $target. Inspect/merge manually." }
    Write-Host "UNCHANGED $($_.Name)"
  } else {
    Copy-Item $_.FullName $target
    Write-Host "COPIED $($_.Name)"
  }
}
Write-Host 'Done. Run design-system resource/Gradle checks before use.'
