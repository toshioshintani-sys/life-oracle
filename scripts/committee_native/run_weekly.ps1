# ライフオラクル制作委員会 — 週次会議ランナー（無人実行）
# タスクスケジューラ LifeOracle_Committee_Weekly（毎週月曜19:00 JST）から起動される。
# GitHub Actions（生API課金）の後継＝ローカルのClaude Codeサブスク課金枠でTaskツールによる
# 5担当会議を実行する。2026-07-09 制定。

$ErrorActionPreference = "Stop"
# 2026-07-13修正：このファイルにBOMなしUTF-8で日本語パスを書くと、Task Scheduler経由で実際に
# 起動されるクラシックPowerShell(powershell.exe)が誤ったコードページで読み、パス文字列が壊れて
# "見つかりません" エラーになる実障害があった。このファイル自体をUTF-8 BOM付きで保存することで解消する
# （$PSScriptRoot基点への変更は別の空値エラーを誘発したため、ハードコードパス＋BOMに戻した）。
$repoRoot = "C:\Users\user\Desktop\Claude_work\ライフオラクル"
$promptFile = Join-Path $repoRoot "scripts\committee_native\weekly_prompt.md"
$logDir = Join-Path $repoRoot "scripts\committee_native\logs"
$stamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$logFile = Join-Path $logDir "run_$stamp.json"

Set-Location $repoRoot

# .env から SLACK_WEBHOOK_URL を読む（失敗通知用。committee.py と同じ変数名）
$slackWebhook = $null
$envFile = Join-Path $repoRoot ".env"
if (Test-Path $envFile) {
    $line = Get-Content $envFile | Where-Object { $_ -match "^SLACK_WEBHOOK_URL=" } | Select-Object -First 1
    if ($line) { $slackWebhook = $line -replace "^SLACK_WEBHOOK_URL=", "" }
}

function Send-FailureSlack($message) {
    if ($slackWebhook) {
        try {
            $body = @{ text = "⚠️ *委員会 週次会議（無人実行）失敗*`n$message" } | ConvertTo-Json -Compress
            Invoke-RestMethod -Uri $slackWebhook -Method Post -ContentType "application/json" -Body $body -TimeoutSec 15 | Out-Null
        } catch {}
    }
}

try {
    $prompt = Get-Content -Raw -Encoding UTF8 $promptFile
    $claudeBin = (Get-Command claude -ErrorAction Stop).Source

    # サブスク課金の保証：環境にANTHROPIC_API_KEYが居ると claude -p がAPI課金に化けるため除去
    # （world-oracle-staging/agents/_runtime/agent_base.py の _call_via_subscription と同じ防御）
    Remove-Item Env:\ANTHROPIC_API_KEY -ErrorAction SilentlyContinue

    # 2026-07-13: stdin経由(パイプ)を試したが claude.ps1 がラッパースクリプトのため
    # 正しく転送されず異常な結果になったため、実績のある位置引数渡しに戻した。
    # プロンプト本文はJIS X 0208圏内で長くなりすぎない（＋埋め込みダブルクォートを避ける）よう
    # weekly_prompt.md 側で管理すること。
    $result = & $claudeBin -p --permission-mode bypassPermissions --model claude-sonnet-5 --output-format json $prompt 2>&1
    $exitCode = $LASTEXITCODE

    $result | Out-File -FilePath $logFile -Encoding utf8

    if ($exitCode -ne 0) {
        Send-FailureSlack "claude -p が exit code $exitCode で終了。ログ: $logFile"
        exit 1
    }
} catch {
    Send-FailureSlack "run_weekly.ps1 で例外発生: $($_.Exception.Message)"
    exit 1
}
