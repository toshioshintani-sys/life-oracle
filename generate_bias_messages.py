import anthropic
import json
import time
import os

API_KEY = "YOUR_API_KEY_HERE"
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "public", "data", "bias_messages.json")

TYPES = [
    ("Te-光", "指揮者"),
    ("Te-影", "鉄砲玉"),
    ("Ti-光", "職人"),
    ("Ti-影", "堂々巡り"),
    ("Fe-光", "聴き手"),
    ("Fe-影", "八方美人"),
    ("Fi-光", "求道者"),
    ("Fi-影", "頑固者"),
    ("Se-光", "今を楽しむ人"),
    ("Se-影", "思いつき人"),
    ("Si-光", "コツコツ人"),
    ("Si-影", "現状維持人"),
    ("Ne-光", "発明家"),
    ("Ne-影", "三日坊主"),
    ("Ni-光", "先読み人"),
    ("Ni-影", "独走者"),
]

BIASES = [
    ("loss_high",       "損失回避",       "損を極端に恐れ、リスクを過剰に避ける"),
    ("confirmation",    "確証バイアス",   "自分の信念に合う情報だけを集める"),
    ("social",          "同調バイアス",   "周りの意見・行動に合わせてしまう"),
    ("present_low",     "現在バイアス",   "今の快楽を優先し、将来を過小評価する"),
    ("status_quo",      "現状維持バイアス", "変化を避け、現状にとどまろうとする"),
    ("overconfidence",  "過信バイアス",   "自分の能力・判断を過大評価する"),
    ("sunk_cost",       "サンクコストバイアス", "過去の投資に引きずられる"),
    ("anchoring",       "アンカリングバイアス", "最初の情報に判断が引きずられる"),
]

PROMPT_TEMPLATE = """あなたはユング認知機能タイプ診断アプリの文章ライターです。

以下の条件でバイアス気づきメッセージを1件作成してください。

【タイプ】{type_id}（{type_name}）
【バイアス】{bias_name}：{bias_desc}

【仕様】
- 文字数：200〜300字
- 口調：寄り添い系、「〜かもしれません」「〜ではないでしょうか」を使う
- 構成：①このタイプ×バイアスの組み合わせで起きがちなこと → ②その気づき → ③一歩前に進むためのヒント
- このタイプの特性とバイアスが矛盾する場合（例：先読み人なのに現在バイアスがある）も必ず書く。矛盾こそがリアルな人間の姿なので、「頭ではわかっているのに行動が伴わない」という切り口で書く

メッセージ本文のみ出力してください（タイトルや見出し不要）。"""


def load_existing():
    if os.path.exists(OUTPUT_PATH):
        with open(OUTPUT_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def save(data):
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def main():
    client = anthropic.Anthropic(api_key=API_KEY)
    data = load_existing()

    total = len(TYPES) * len(BIASES)
    done = 0
    skipped = 0

    for type_id, type_name in TYPES:
        for bias_id, bias_name, bias_desc in BIASES:
            key = f"{type_id}_{bias_id}"

            if key in data:
                skipped += 1
                done += 1
                print(f"[SKIP] {key}")
                continue

            prompt = PROMPT_TEMPLATE.format(
                type_id=type_id,
                type_name=type_name,
                bias_name=bias_name,
                bias_desc=bias_desc,
            )

            try:
                response = client.messages.create(
                    model="claude-opus-4-5",
                    max_tokens=600,
                    messages=[{"role": "user", "content": prompt}],
                )
                text = response.content[0].text.strip()
                data[key] = text
                save(data)
                done += 1
                print(f"[OK] {key} ({len(text)}字) [{done}/{total}]")
            except Exception as e:
                print(f"[ERROR] {key}: {e}")
                save(data)

            time.sleep(1)

    print(f"\n=== 完了 ===")
    print(f"総キー数: {len(data)} / {total}")
    missing = [
        f"{t[0]}_{b[0]}"
        for t in TYPES
        for b in BIASES
        if f"{t[0]}_{b[0]}" not in data
    ]
    if missing:
        print(f"未生成: {len(missing)}件")
        for k in missing:
            print(f"  - {k}")
    else:
        print("全128件揃っています！")


if __name__ == "__main__":
    main()
