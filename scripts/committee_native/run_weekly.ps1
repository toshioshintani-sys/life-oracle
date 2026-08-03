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
    #
    # 2026-08-03 追加：**入出力とも UTF-8 を明示する。**
    # この日の会議は exit 0 で終わったのに、実際には 8.6秒・1ターンで
    # 「直前のメッセージにはファイル内容の断片だけで、具体的な依頼が見当たりません」と
    # 返ってきた＝**日本語プロンプトが壊れて届いていた**。7/13 の成功時は 602秒・21ターン。
    # Task Scheduler が起動するクラシック PowerShell は既定の符号化が CP932 なので、
    # $OutputEncoding を UTF-8 にしないと、ネイティブコマンドへ渡す引数が化ける。
    # ログ側（Console.OutputEncoding）も同じ理由で化けていた。
    $prevOut = [Console]::OutputEncoding
    $prevOutputEncoding = $OutputEncoding
    try {
        [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
        $OutputEncoding = [System.Text.UTF8Encoding]::new($false)
        $result = & $claudeBin -p --permission-mode bypassPermissions --model claude-sonnet-5 --output-format json $prompt 2>&1
        $exitCode = $LASTEXITCODE
    } finally {
        [Console]::OutputEncoding = $prevOut
        $OutputEncoding = $prevOutputEncoding
    }

    # -Encoding utf8 は Windows PowerShell 5.1 だと BOM 付きになるので、BOMなしで書く
    [System.IO.File]::WriteAllText($logFile, ($result | Out-String), [System.Text.UTF8Encoding]::new($false))

    if ($exitCode -ne 0) {
        # 失敗の中身を見て、**何をすればいいか**まで通知に書く（2026-07-31 追加）。
        #
        # 2026-07-14 にCLIの認証が失効し、7/20・7/27 の週次会議が2回連続で開かれなかった。
        # 通知自体は飛んでいたのに「exit code 1」としか書いておらず、2週間気づかれなかった。
        # 週次は次の機会が7日後なので、1回見落とすと丸ごと1週間失う。原因の種類まで言わせる。
        $raw = ($result | Out-String)
        if ($raw -match 'authentication_error|OAuth access token has expired|Invalid authentication credentials|401') {
            Send-FailureSlack ("**CLIの認証が失効しています。**今週の会議は開かれていません。`n`n" +
                "対処（俊雄さんの操作が必要）：ターミナルで claude auth login を実行しブラウザで承認。`n" +
                "毎回切れるのを止めるなら claude setup-token で長期トークンへ切替（無人実行用・サブスク必要）。`n`n" +
                "※ claude auth status は「ログイン済み」と出ます。保存済みトークンが失効していても" +
                "status は通るので、それだけでは判定できません。`n" +
                "※ 同じ認証を使うサブスクやめたの価格判定（毎朝7:30）も同時に止まります。`n" +
                "ログ: $logFile")
            exit 1
        }
        Send-FailureSlack "claude -p が exit code $exitCode で終了。ログ: $logFile"
        exit 1
    }

    # exit 0 でも「実際には何もしていない」回を検出する（2026-08-03 追加）。
    #
    # この日の会議は exit 0・is_error false で終わったが、中身は 8.6秒・1ターンで
    # 「具体的な依頼が見当たりません」と聞き返しただけだった。プロンプトが壊れて届いており、
    # 会議は開かれていない。**見た目だけ緑**の典型で、これが通ると誰も気づかない。
    # 正常時の実績は 602秒・21ターン（2026-07-13）なので、桁で判別できる。
    # 週次は次の機会が7日後なので、1回の空振りが丸ごと1週間の損失になる。
    try {
        $j = ($result | Out-String) | ConvertFrom-Json
        $sec = [int](($j.duration_ms | Measure-Object -Sum).Sum / 1000)
        $turns = [int]$j.num_turns
        if ($turns -le 1 -or $sec -lt 60) {
            Send-FailureSlack ("**委員会が空振りしました。**exit 0 ですが会議は開かれていません。`n`n" +
                "所要 $sec 秒 / ターン数 $turns（正常時の実績は約600秒・21ターン）。`n" +
                "プロンプトが壊れて届いた疑いがあります（日本語の符号化・引数の切り詰め）。`n" +
                "ログ: $logFile")
            exit 1
        }
    } catch {
        # JSONとして読めない場合。**「空振り」と断定はしない。**
        # 過去ログを全件かけたところ、唯一の本番成功回（2026-07-13・602秒/21ターン）も
        # 解釈不可だった。日本語の報告文が化けてJSONを壊していたためで、会議自体は成立していた。
        # ＝この分岐で「失敗」と言い切ると、成功した回まで失敗と報告することになる。
        # 上の符号化修正でこれは解消される見込みだが、直らなければ判定不能のまま黙るより
        # 「見に行ってほしい」と伝えるほうがよいので、通知は出して exit 1 にする。
        Send-FailureSlack ("委員会の出力をJSONとして解釈できませんでした。**会議が成立したかどうか判定できません。**`n" +
            "ログを直接確認してください（会議が成立していれば数百秒・20ターン前後の記録が残ります）。`n" +
            "ログ: $logFile")
        exit 1
    }
} catch {
    Send-FailureSlack "run_weekly.ps1 で例外発生: $($_.Exception.Message)"
    exit 1
}
