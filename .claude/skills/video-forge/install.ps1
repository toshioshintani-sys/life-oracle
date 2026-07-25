# video-forge を user レベルの skill として入れる（= どのプロジェクトでも発動する）。
#
#   powershell -ExecutionPolicy Bypass -File install.ps1
#   powershell -ExecutionPolicy Bypass -File install.ps1 -Dest "D:\skills"
#
# 既に入っている場合は上書きする。
param([string]$Dest = "$env:USERPROFILE\.claude\skills")

$ErrorActionPreference = 'Stop'
$src = Split-Path -Parent $MyInvocation.MyCommand.Path
$target = Join-Path $Dest 'video-forge'

New-Item -ItemType Directory -Force -Path $Dest | Out-Null
if (Test-Path $target) { Remove-Item -Recurse -Force $target }
New-Item -ItemType Directory -Force -Path $target | Out-Null

# node_modules / out は持っていかない
$exclude = @('node_modules', 'out', 'package-lock.json')
Get-ChildItem -Path $src -Recurse -File | Where-Object {
  $rel = $_.FullName.Substring($src.Length).TrimStart('\')
  -not ($exclude | Where-Object { $rel -split '\\' -contains $_ })
} | ForEach-Object {
  $rel = $_.FullName.Substring($src.Length).TrimStart('\')
  $dst = Join-Path $target $rel
  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $dst) | Out-Null
  Copy-Item $_.FullName -Destination $dst -Force
}

Write-Host "installed: $target"
Write-Host "次のセッションから、どのプロジェクトでも「動画」の依頼で発動します。"
