# X投稿ルート憲章（X_POSTING_CHARTER）

> ライフオラクルのX自動投稿の **唯一の本番経路** と、その正しさを保証する不変条件・監視・責任を定める。
> 制定 2026-06-21（note URL欠落バグの恒久対策・proposal-stress-test 済）。**この文書＋ガードコードが「責任者」である**（後述）。

---

## 1. 単一経路の宣言（ルート一本化）

- ライフオラクルのX自動投稿の**唯一の本番経路は `Claude_work/x_posting_system`（Playwright/ブラウザ常駐方式）**。
  - 実行：定時タスク `LifeOracle_X_Resident` / `_0650` / `_2220` → `scheduler/start_resident.ps1` → `x_posting_system/main.py` → `poster.post()` → `post_single()`。
- **第2の投稿経路を作らない。** `ライフオラクル/scripts/x_poster.py`（API/OAuth方式・PR#17）は**本番外の将来候補**として温存するのみ。本番に並走させない（「どっちが本番か」の混同が2026-06-21にバグを生んだ）。
- API方式へ移行する場合は、本憲章を更新し、ブラウザ式を明示的に退役させてから一本化する（並走させない）。

## 2. 不変条件（INVARIANT・二度と破らない）

**すべてのX投稿は、本文確定を `poster.finalize_tweet_text(payload, article)` 1関数（単一チョークポイント）に通し、note記事URLを構造的に含む。**

- `finalize_tweet_text` が `payload["article_url"]`（generator が設定）を本文末尾へ**冪等付与**（既にあれば二重付与しない）。**ClaudeにURLを生成させない**（出力が不安定なため）。
- 投稿直前に `_url_guard_or_abort()` が**最後の砦**：`article_url` が在るのに本文に無ければ **fail-loud で投稿中止＋Slackアラート**（URLが元々無い純粋告知ツイートは対象外＝誤殺しない）。
- ∴ **URL欠落のまま投稿が出ることは構造的に不可能**（付与される、さもなくば止まって通知される）。

## 3. 責任の所在（"責任者"の物質化）

- **責任者＝この憲章（§2 不変条件）＋ `poster.py` の `finalize_tweet_text`/`_url_guard_or_abort`（自動ガード）そのもの。** 人格でなく**仕組み**が責任を持つ（Claudeはセッション間で持続しないため、口頭宣言は無効とする）。
- **維持義務**：`x_posting_system/poster.py` を触る者（Claude を含む）は、本憲章の不変条件を**壊してはならない**。`finalize_tweet_text` を経由しない投稿経路を足す／ガードを外す変更は**禁止**。
- セッション開始時・committee はこの憲章を参照する（CLAUDE.md からリンク・[[memory: project_x_posting_url_fix]]）。

## 4. 監視（必ず監視する＝物質化された宣言）

- **一次監視＝リアルタイム**：`_url_guard_or_abort` が**全投稿を投稿直前に検証**。発火時は投稿中止＋Slack `🛑 X投稿ガード発火` 通知（無人で誤投稿が出ない・失敗が必ず可視化される）。
- **二次監視＝定期の改ざん検知**：既存の `LifeOracle_X_CheckpointReview`（隔週・`checkpoint_review.py`・API不使用可）が `poster.py` に本憲章のガード（`finalize_tweet_text`/`_url_guard_or_abort`）が**存在し続けているか**を点検し、欠落していれば警告。新規スケジュールタスクは増やさない（相乗り＝最小）。

## 5. やってはいけない（DO-NOT）

1. 第2の本番投稿経路を作る／API版を本番に並走させる。
2. ClaudeにツイートにURLを生成・付与させる（finalizeが構造的に行う）。
3. `finalize_tweet_text` を経由しない投稿、または `_url_guard_or_abort` を外す変更。
4. 「二度と起きない」を口実にした過剰設計（ガードは数行・新インフラ最小に保つ）。

## 6. 版管理（critical path のバックアップ）

`x_posting_system` は git管理外。**正本の保証ロジックを下記に版管理保存**する（local の poster.py はこれに準拠せねばならない・改ざん時の復元元）。

```python
def finalize_tweet_text(payload: dict, article=None) -> str:
    """投稿本文の唯一の確定経路。note記事URLを冪等に末尾付与する。"""
    posts = payload.get("posts", [])
    text = posts[0]["content"] if posts else ""
    note_url = (payload.get("article_url") or (article or {}).get("url") or "").strip()
    if note_url and note_url not in text:
        text = text.rstrip() + "\n" + note_url
    return text

def _url_guard_or_abort(text, payload, article) -> bool:
    """fail-loud ガード：article_url が在るのに本文に無ければ False＝投稿中止＋Slack。純粋告知は対象外。"""
    note_url = (payload.get("article_url") or (article or {}).get("url") or "").strip()
    if note_url and note_url not in text:
        # log.error + Slack 通知してから False
        return False
    return True
```

> 推奨（将来）：`x_posting_system` 全体を版管理に入れる or repo へ取り込む（critical path が消えないように）。今回は本憲章に正本を保存して最小対応。

---
*この憲章は X投稿の正しさの最終的な拠り所。変更時は proposal-stress-test を通し、不変条件(§2)を弱める変更は原則禁止。*
