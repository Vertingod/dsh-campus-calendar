# 一键串联本地可执行部分：init-config（若缺）→ build → test → preflight → market-entry → star-entry 提示
# 需要联网的步骤（gh repo create / fork / PR / npm publish）仍按 docs/RELEASE.md 手动执行。
param(
  [switch]$SkipStar   # 跳过 Star 引导接入
)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot

if (-not (Test-Path (Join-Path $root 'release.config.json')) -or (Get-Content (Join-Path $root 'release.config.json') -Raw) -match '<') {
  Write-Host '== 1. release.config.json 缺失或含占位符，请先填写 category / description ==' -ForegroundColor Yellow
  node (Join-Path $root 'tools\release\init-config.mjs')
  Write-Host '   填好后重新运行本脚本。' -ForegroundColor Yellow
  exit 2
}

Write-Host '== 2. build ==' -ForegroundColor Cyan
Push-Location $root; npm run build; if ($LASTEXITCODE -ne 0) { Pop-Location; exit 1 }
Write-Host '== 3. test ==' -ForegroundColor Cyan
npm test; if ($LASTEXITCODE -ne 0) { Pop-Location; exit 1 }
Write-Host '== 4. preflight ==' -ForegroundColor Cyan
node tools\release\preflight.mjs --strict; if ($LASTEXITCODE -ne 0) { Pop-Location; exit 1 }
Write-Host '== 5. market entry ==' -ForegroundColor Cyan
node tools\release\market-entry.mjs
if (-not $SkipStar) {
  Write-Host '== 6. star entry ==' -ForegroundColor Cyan
  node tools\release\star-entry.mjs
  Write-Host '   记得把 StarButton / maybeRemindStar 接进设置卡后重跑 npm run build。' -ForegroundColor Yellow
}
Pop-Location
Write-Host '== 本地发布准备完成。联网步骤（建仓/PR/发版）见 docs/RELEASE.md P1/P3/P5 ==' -ForegroundColor Green
