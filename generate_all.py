"""
ライフオラクル 処方箋 一括生成スクリプト（OpenAI版）
残り15職種 × 16タイプ × 7年代 = 1,680パターン

使い方:
1. コマンドプロンプトを開く
2. cd Desktop と入力してEnter
3. python generate_all.py と入力してEnter
4. 寝る（朝起きたら完了しています）
"""

import json
import urllib.request
import urllib.error
import time
import os

# ===== 設定 =====
API_KEY = os.environ.get("OPENAI_API_KEY") or "YOUR_API_KEY_HERE"
OUTPUT_DIR = "処方箋データ"  # 保存先フォルダ名（このスクリプトと同じ場所に作成される）
MODEL = "gpt-4o-mini"

TYPES = [
    {"id": "Te-光", "name": "指揮者", "state": "光", "feature": "論理・実行・組織化"},
    {"id": "Te-影", "name": "鉄砲玉", "state": "影", "feature": "論理・実行・組織化"},
    {"id": "Ti-光", "name": "職人", "state": "光", "feature": "分析・探求・原理"},
    {"id": "Ti-影", "name": "堂々巡り", "state": "影", "feature": "分析・探求・原理"},
    {"id": "Fe-光", "name": "聴き手", "state": "光", "feature": "共感・調和・つながり"},
    {"id": "Fe-影", "name": "八方美人", "state": "影", "feature": "共感・調和・つながり"},
    {"id": "Fi-光", "name": "求道者", "state": "光", "feature": "信念・価値観・誠実"},
    {"id": "Fi-影", "name": "頑固者", "state": "影", "feature": "信念・価値観・誠実"},
    {"id": "Se-光", "name": "今を楽しむ人", "state": "光", "feature": "行動・感覚・今この瞬間"},
    {"id": "Se-影", "name": "思いつき人", "state": "影", "feature": "行動・感覚・今この瞬間"},
    {"id": "Si-光", "name": "コツコツ人", "state": "光", "feature": "記憶・安定・継承"},
    {"id": "Si-影", "name": "現状維持人", "state": "影", "feature": "記憶・安定・継承"},
    {"id": "Ne-光", "name": "発明家", "state": "光", "feature": "発想・可能性・拡散"},
    {"id": "Ne-影", "name": "三日坊主", "state": "影", "feature": "発想・可能性・拡散"},
    {"id": "Ni-光", "name": "先読み人", "state": "光", "feature": "洞察・ビジョン・先読み"},
    {"id": "Ni-影", "name": "独走者", "state": "影", "feature": "洞察・ビジョン・先読み"},
]

AGES = ["10代", "20代", "30代", "40代", "50代", "60代", "70代以上"]

# 残り15職種（会社員・公務員・医療職は除く）
JOBS = [
    "教育職", "士業", "クリエイター", "接客", "調理", "理美容師",
    "介護", "フリーランス", "自営業", "一次産業", "建設業",
    "主婦/主夫", "非正規雇用", "学生", "無職"
]


def build_prompt(type_info, job, age):
    return f"""あなたはライフ・オラクルというアプリの文章生成AIです。
以下の条件で処方箋を生成してください。

【タイプ】{type_info['name']}（{type_info['feature']}・{type_info['state']}）
【職種】{job}
【年代】{age}

【ルール】
- 全体850〜950字
- 「あなた」に語りかけ続ける
- 専門用語を使わない
- 断定しない（〜かもしれません）
- 影は責めない
- 短い文を重ねてリズムよく
- 章タイトルは含めず、本文のみ出力する
- 各章の間は空行で区切る

【章立て】
① あなたのこと（約150字）
タイプの特徴を「あなた、〇〇ですよね」から始めて描写する

② あなたの目に映る景色（約250字）
{job}×{age}の人が感じやすい状況を、決めつけずに描写する

③ 今のあなたへ（約200字）
このタイプがこの職種・年代でつまずきやすいことを、寄り添いながら伝える

④ これからのあなたへ（約250字）
具体的な行動を2つ提案する。小さくてできそうなことに絞る

⑤ 明日からの一歩（約150字）
明日すぐできる、たったひとつの行動で締める

必ず①〜⑤の順番で、章タイトルなしの本文のみ出力してください。"""


def generate_one(type_info, job, age, api_key):
    prompt = build_prompt(type_info, job, age)
    payload = json.dumps({
        "model": MODEL,
        "max_tokens": 1000,
        "messages": [{"role": "user", "content": prompt}]
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=60) as res:
            data = json.loads(res.read().decode("utf-8"))
            return data["choices"][0]["message"]["content"]
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        raise Exception(f"HTTP {e.code}: {body}")


def save_job_json(job, results):
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    filename = os.path.join(OUTPUT_DIR, f"処方箋_{job}.json")
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)


def load_job_json(job):
    filename = os.path.join(OUTPUT_DIR, f"処方箋_{job}.json")
    if os.path.exists(filename):
        with open(filename, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def main():
    print("=" * 50)
    print("ライフオラクル 処方箋 一括生成（OpenAI版）")
    print("=" * 50)

    if not API_KEY or API_KEY == "ここにOpenAI APIキーを入力してください":
        print("\n⚠ APIキーが設定されていません")
        print("スクリプトの上部にある API_KEY = の部分に")
        print("OpenAI APIキーを入力してください")
        return

    total_jobs = len(JOBS)
    for job_idx, job in enumerate(JOBS, 1):
        print(f"\n[{job_idx}/{total_jobs}] {job} を開始...")

        # 既存データ読み込み（途中再開対応）
        results = load_job_json(job)
        existing_keys = set(f"{r['typeId']}_{r['age']}" for r in results)
        done = len(results)
        total = len(TYPES) * len(AGES)

        if done == total:
            print(f"  ✓ {job} は完了済みです（{done}件）スキップします")
            continue

        for type_info in TYPES:
            for age in AGES:
                key = f"{type_info['id']}_{age}"
                if key in existing_keys:
                    continue

                attempt = 0
                success = False
                while attempt < 3 and not success:
                    try:
                        text = generate_one(type_info, job, age, API_KEY)
                        chars = len(text.replace("\n", "").replace(" ", ""))
                        results.append({
                            "typeId": type_info["id"],
                            "typeName": type_info["name"],
                            "state": type_info["state"],
                            "feature": type_info["feature"],
                            "job": job,
                            "age": age,
                            "text": text,
                            "chars": chars
                        })
                        existing_keys.add(key)
                        flag = "✓" if 850 <= chars <= 950 else "⚠"
                        done += 1
                        print(f"  {flag} {type_info['name']} × {age}: {chars}字 ({done}/{total})")
                        success = True

                        # 1件ごとに保存（途中で止まっても安全）
                        save_job_json(job, results)

                    except Exception as e:
                        attempt += 1
                        wait = 5 * attempt
                        print(f"  リトライ {attempt}/3 ({wait}秒待機): {e}")
                        time.sleep(wait)

                if not success:
                    print(f"  ✗ スキップ: {type_info['name']} × {age}")

                time.sleep(1.5)

        print(f"  ✅ {job} 完了: {len(results)}件")

    print("\n" + "=" * 50)
    print("🎉 全職種の生成が完了しました！")
    print(f"保存先: {OUTPUT_DIR} フォルダ")
    print("=" * 50)


if __name__ == "__main__":
    main()
