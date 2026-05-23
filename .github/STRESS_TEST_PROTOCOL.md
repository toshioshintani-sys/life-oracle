# Stress Test Protocol（GitHub Actions / CI 用・インライン版）

> このファイルは GitHub Actions や CI/CD 上で動く Claude（gachijin-pipeline 等）に対して、
> 「重要な意思決定の前に4ステップ検証を行う」プロトコルを伝えるための独立ドキュメント。
>
> ローカル Claude Code の `~/.claude/skills/proposal-stress-test/SKILL.md` と同じ思想を、
> リモート環境（claude-sonnet-4-5 を呼ぶ workflow 等）でも参照できる形で保存。

---

## いつ発火するか

このリポジトリの GitHub Actions / CI で動く Claude は、以下のいずれかに当てはまる作業の前に必ず4ステップ検証を内部で実行すること：

### A. 永続的な影響を与える変更
- 設計憲法・運用ルール・命名規約の策定/変更
- リポジトリ直下の `CLAUDE.md` 構造変更
- 価格戦略（yoru/wata/jin/gachi/post の価格表）の変更
- バイアス選択原則の改訂（`tasks/bias_usage_log.md` のルール変更）
- Reference ルール（タイトル・本文の言語化基準）の改訂
- サムネ画風定義（`design.md`）の変更
- pipeline/main.py の本格的なリファクタ

### B. 規模が大きい実装
- 既存記事の一括書き換え（pipeline/unpay_yoru.py 等で過去 N 本に PUT する作業）
- 全シリーズ・全記事への一括修正
- 50件以上の note.com 投稿に対する変更

### C. 新シリーズ立ち上げ・廃止
- yoru/wata/jin/gachi/post 以外の新シリーズを開始する判断
- 既存シリーズを停止・統合する判断

### D. マネタイズ方針の変更
- 価格テーブル（300円/500円/980円/月額メンバーシップ）の改定
- 新規アフィリエイト導入・既存停止

### E. 長時間自動実行
- 5h 以上のジョブを連続実行する workflow
- 大量の note.com API 呼び出しを伴うバッチ処理

---

## 発火しないでよい場合

- 1記事の本文修正・サムネ差し替え
- 既存運用ルールに従った定常生成（gachijin-pipeline の通常実行など）
- 情報取得・調査・lessons.md 参照
- 自動デプロイ・自動投稿のルーチン処理

---

## 4ステップ検証（インライン版）

```
Step 1：答え
  自分の最良の答えを 1-2行で明確に出す（曖昧な表現禁止）
  理由を箇条書きで 3-5 個

Step 2：否定
  その答えへの反論を 5-7 個リストアップ
  自分が一番厳しい批評家のつもりで
  「長すぎる」「理論先行」「過剰」「縛りすぎ」など実質的な否定を出す

Step 3：つぶす
  それぞれの反論を表形式で検証
  | # | 否定 | 検証 | 結論 |
  「データ・実装容易性・既存事実」を根拠にする
  ✅ つぶせる / ❌ つぶせない を明示

Step 4：結論
  全部つぶせた → 答えを確定し「問題なし」と報告
  つぶせなかった否定が残った → 答えを修正して Step 1 から再実行（最大3周）
  3周しても確定しない → 人間（俊雄さん）の判断を仰ぐ
```

---

## アンチパターン

- ❌ 「全部正しい」と結論する（必ず1個は否定が成立するはず）
- ❌ 反論が形式的すぎる（「もっと考えるべき」など内容のない否定）
- ❌ 反論を立てずに「問題ありません」と結論する
- ❌ Step 3 で曖昧な反証（「たぶん大丈夫」など）

---

## このプロトコルの目的

**Claude の暴走防止 + 過剰なオーバーエンジニアリングの予防**

ライフオラクルは note 記事 90+ 本のコンテンツ資産を持つ。
記事生成の標準フローは stress-test 不要だが、「設計憲法レベル」「シリーズ全体に影響する変更」を CI 上で自動的に行う場合、必ずこのプロトコルを通すこと。

---

## 使い方（workflow / script 内で Claude API を呼ぶ場合）

Python（gachijin-pipeline 系）で Anthropic API を呼ぶ際、system prompt の冒頭にこのファイルの内容を含める：

```python
import pathlib
PROTOCOL = pathlib.Path('.github/STRESS_TEST_PROTOCOL.md').read_text(encoding='utf-8')

system_prompt = f"""
{PROTOCOL}

---

[Your actual task instructions here]
"""
```

これにより、CI 上で動く Claude（claude-sonnet-4-5 など）も同じ思想で意思決定を検証する。

---

## 関連ファイル

- ユーザーレベル憲法：`~/.claude/CLAUDE.md`（ローカル）
- skill 本体：`~/.claude/skills/proposal-stress-test/SKILL.md`（ローカル）
- プロジェクト憲法：このリポジトリの `CLAUDE.md`
- バイアス使用履歴：`ライフオラクルnoteネタ/tasks/bias_usage_log.md`
- lessons.md：`ライフオラクルnoteネタ/tasks/lessons.md`

---

*作成日：2026-05-23*
*由来：proposal-stress-test 5階層配備（ローカル4層 + リモート1層）*
