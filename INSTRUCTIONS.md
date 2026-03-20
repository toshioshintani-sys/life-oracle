# ライフオラクル：診断質問フォーマット リニューアル実装指示書

## 概要

診断質問を「4択から1つ選ぶ」形式から「2択軸 × 4段階強度」形式に変更する。
質問数は31問から32問（各軸8問均等）に変更する。

---

## 1. 変更するファイル

以下のファイルを変更する。ファイル名・パスは現行のプロジェクト構成に合わせること。

- 質問データファイル（questions.js / questions.ts など）
- スコアリングロジックファイル（scoring.js / scoring.ts など）
- 診断UIコンポーネント（質問表示・回答ボタン部分）

---

## 2. 新しい回答形式

全問共通の4段階ボタンを使う。

```
[強くそう]  [ややそう]  [ややちがう]  [強くちがう]
```

各質問は「左極ラベル ←→ 右極ラベル」の2軸構造。
中間なし（偶数設計）。

---

## 3. スコアリング仕様

### 通常項目（28問）

| 回答 | 点数 |
|------|------|
| 強くそう | 3点 |
| ややそう | 2点 |
| ややちがう | 1点 |
| 強くちがう | 0点 |

### 逆転項目（4問）

通常と逆に採点する。

| 回答 | 点数 |
|------|------|
| 強くそう | 0点 |
| ややそう | 1点 |
| ややちがう | 2点 |
| 強くちがう | 3点 |

コード上は `score = q.reversed ? (3 - value) : value` で処理する。

### 軸の判定

各軸8問 × 最大3点 = 最大24点。

- **13点以上** → 左極（E / S / T / J）
- **12点以下** → 右極（I / N / F / P）

傾向の強さ（オプション・結果画面のコメントに使える）：

| 点数 | 強さ |
|------|------|
| 20〜24点 | 強い傾向 |
| 16〜19点 | やや傾向あり |
| 13〜15点 | わずかに傾向あり |
| 10〜12点 | わずかに逆側 |
| 5〜 9点 | やや逆側傾向 |
| 0〜 4点 | 強い逆側傾向 |

---

## 4. 質問データ（全32問）

以下をそのまま questions データとして使う。
`reversed: true` の4問だけ採点時に反転処理すること。

```js
export const questions = [

  // ── E / I 軸（外向 ／ 内向）──────────────────────────────
  {
    id: 'EI_1',
    axis: 'EI',
    tag: '人との会話',
    stem: '久しぶりに会った人と話していると、気づけば自分のほうが話している時間が長い。',
    leftLabel: '外向（E）',
    rightLabel: '内向（I）',
    reversed: false,
  },
  {
    id: 'EI_2',
    axis: 'EI',
    tag: '回復パターン',
    stem: '疲れたとき、誰かに連絡して話したり出かけたりするとかえって元気になる。',
    leftLabel: '外向（E）',
    rightLabel: '内向（I）',
    reversed: false,
  },
  {
    id: 'EI_3',
    axis: 'EI',
    tag: 'グループ',
    stem: '初めて入ったグループや場所で、自分から話しかけることに抵抗がない。',
    leftLabel: '外向（E）',
    rightLabel: '内向（I）',
    reversed: false,
  },
  {
    id: 'EI_4',
    axis: 'EI',
    tag: '考え方',
    stem: '何かを考えるとき、頭の中で整理するより誰かに話しながらまとめていくほうがしっくりくる。',
    leftLabel: '外向（E）',
    rightLabel: '内向（I）',
    reversed: false,
  },
  {
    id: 'EI_5',
    axis: 'EI',
    tag: '一人の時間',
    stem: '一人でいる時間が長くなると、なんとなく落ち着かなくてそわそわしてくる。',
    leftLabel: '外向（E）',
    rightLabel: '内向（I）',
    reversed: false,
  },
  {
    id: 'EI_6',
    axis: 'EI',
    tag: 'つながり方',
    stem: '少数の人と深くつきあうより、いろんな人と広くつながっていたい気持ちが強い。',
    leftLabel: '外向（E）',
    rightLabel: '内向（I）',
    reversed: false,
  },
  {
    id: 'EI_7',
    axis: 'EI',
    tag: '沈黙',
    stem: '誰かと一緒にいるとき、会話が途切れると気まずくて埋めようとしてしまう。',
    leftLabel: '外向（E）',
    rightLabel: '内向（I）',
    reversed: false,
  },
  {
    id: 'EI_8',
    axis: 'EI',
    tag: '活動後',
    stem: '人が多い場所や賑やかな集まりのあと、消耗するより充実感のほうが残る。',
    leftLabel: '外向（E）',
    rightLabel: '内向（I）',
    reversed: false,
  },

  // ── S / N 軸（感覚 ／ 直観）──────────────────────────────
  {
    id: 'SN_1',
    axis: 'SN',
    tag: '情報の受け取り方',
    stem: '何かを説明されるとき、具体的な例や数字があるほうがずっと頭に入りやすい。',
    leftLabel: '感覚（S）',
    rightLabel: '直観（N）',
    reversed: false,
  },
  {
    id: 'SN_2',
    axis: 'SN',
    tag: '記憶',
    stem: '昔のことを思い出すとき、雰囲気や印象よりも「あのときこうだった」という具体的な出来事として浮かぶ。',
    leftLabel: '感覚（S）',
    rightLabel: '直観（N）',
    reversed: false,
  },
  {
    id: 'SN_3',
    axis: 'SN',
    tag: '興味の向き',
    stem: '「こういうやり方が実際に使える」という話のほうが、「こんな可能性がある」という話より面白いと感じる。',
    leftLabel: '感覚（S）',
    rightLabel: '直観（N）',
    reversed: false,
  },
  {
    id: 'SN_4',
    axis: 'SN',
    tag: '行動の起点',
    stem: '何かを始めるとき、全体像より「まず最初のステップは何か」から考えたほうが動きやすい。',
    leftLabel: '感覚（S）',
    rightLabel: '直観（N）',
    reversed: false,
  },
  {
    id: 'SN_5',
    axis: 'SN',
    tag: '信頼の根拠',
    stem: '「前にうまくいった方法」のほうが、「新しいやり方」より安心して使える。',
    leftLabel: '感覚（S）',
    rightLabel: '直観（N）',
    reversed: false,
  },
  {
    id: 'SN_6',
    axis: 'SN',
    tag: '日常の観察',
    stem: '同じ道を歩いていても、景色の細かな変化（工事・新しい店など）によく気づくほうだ。',
    leftLabel: '感覚（S）',
    rightLabel: '直観（N）',
    reversed: false,
  },
  {
    id: 'SN_7',
    axis: 'SN',
    tag: '空想・妄想',
    stem: '気づくと「もしこうだったら」と現実にない話を頭の中で広げていることがよくある。',
    leftLabel: '感覚（S）',
    rightLabel: '直観（N）',
    reversed: true,  // ⚠ 逆転項目：「そう」と答えるのはN寄り
  },
  {
    id: 'SN_8',
    axis: 'SN',
    tag: 'ひらめき',
    stem: '考えているうちに「なんかこっちな気がする」という感覚が先に来て、理由は後からついてくることが多い。',
    leftLabel: '感覚（S）',
    rightLabel: '直観（N）',
    reversed: true,  // ⚠ 逆転項目：「そう」と答えるのはN寄り
  },

  // ── T / F 軸（思考 ／ 感情）──────────────────────────────
  {
    id: 'TF_1',
    axis: 'TF',
    tag: '意見の評価',
    stem: '誰かの話を聞くとき、「その人がどう感じているか」より「それは正しいか」が気になりやすい。',
    leftLabel: '思考（T）',
    rightLabel: '感情（F）',
    reversed: false,
  },
  {
    id: 'TF_2',
    axis: 'TF',
    tag: 'フィードバック',
    stem: '間違いや改善点を指摘するとき、相手の気持ちより「正確に伝えること」を優先してしまいがちだ。',
    leftLabel: '思考（T）',
    rightLabel: '感情（F）',
    reversed: false,
  },
  {
    id: 'TF_3',
    axis: 'TF',
    tag: 'もめたとき',
    stem: '誰かと意見が食い違ったとき、関係が多少ぎくしゃくしても「正しい結論」を出したいと思う。',
    leftLabel: '思考（T）',
    rightLabel: '感情（F）',
    reversed: false,
  },
  {
    id: 'TF_4',
    axis: 'TF',
    tag: '悩みを聞くとき',
    stem: '友人や知人が悩みを打ち明けてきたとき、共感より先に「どうすれば解決するか」を考えてしまう。',
    leftLabel: '思考（T）',
    rightLabel: '感情（F）',
    reversed: false,
  },
  {
    id: 'TF_5',
    axis: 'TF',
    tag: 'ルールの適用',
    stem: 'ルールは例外を作らず、全員に同じように適用するほうがフェアだと思う。',
    leftLabel: '思考（T）',
    rightLabel: '感情（F）',
    reversed: false,
  },
  {
    id: 'TF_6',
    axis: 'TF',
    tag: '判断の基準',
    stem: '何かを判断するとき「自分がどう感じるか」より「客観的に見てどうか」を軸にしたい。',
    leftLabel: '思考（T）',
    rightLabel: '感情（F）',
    reversed: false,
  },
  {
    id: 'TF_7',
    axis: 'TF',
    tag: '批判への反応',
    stem: '自分の行動や考えを批判されても、感情的にならず「それは正しいか」と冷静に考えられる。',
    leftLabel: '思考（T）',
    rightLabel: '感情（F）',
    reversed: false,
  },
  {
    id: 'TF_8',
    axis: 'TF',
    tag: '人への関心',
    stem: '人と話すとき、その人の感情の動きや人間関係の背景が自然と気になる。',
    leftLabel: '思考（T）',
    rightLabel: '感情（F）',
    reversed: true,  // ⚠ 逆転項目：「そう」と答えるのはF寄り
  },

  // ── J / P 軸（判断 ／ 知覚）──────────────────────────────
  {
    id: 'JP_1',
    axis: 'JP',
    tag: '準備・段取り',
    stem: '何かをやるとき、事前にある程度段取りを決めておかないと落ち着かない。',
    leftLabel: '判断（J）',
    rightLabel: '知覚（P）',
    reversed: false,
  },
  {
    id: 'JP_2',
    axis: 'JP',
    tag: '締め切り',
    stem: '締め切りや期限は、できるだけ余裕をもって前倒しで終わらせたいと思う。',
    leftLabel: '判断（J）',
    rightLabel: '知覚（P）',
    reversed: false,
  },
  {
    id: 'JP_3',
    axis: 'JP',
    tag: '決断のタイミング',
    stem: '選択肢が出そろう前でも、早めに一つに決めてすっきりしたいほうだ。',
    leftLabel: '判断（J）',
    rightLabel: '知覚（P）',
    reversed: false,
  },
  {
    id: 'JP_4',
    axis: 'JP',
    tag: '予定外への反応',
    stem: '決めていた予定が急に変わると、ちょっとしたことでもストレスを感じやすい。',
    leftLabel: '判断（J）',
    rightLabel: '知覚（P）',
    reversed: false,
  },
  {
    id: 'JP_5',
    axis: 'JP',
    tag: '空間・持ち物',
    stem: '自分のまわりの空間や持ち物は、整理されていないと気になって集中できない。',
    leftLabel: '判断（J）',
    rightLabel: '知覚（P）',
    reversed: false,
  },
  {
    id: 'JP_6',
    axis: 'JP',
    tag: 'やることリスト',
    stem: 'やることを頭の中だけでなく、書き出したりリストにしておかないと不安になる。',
    leftLabel: '判断（J）',
    rightLabel: '知覚（P）',
    reversed: false,
  },
  {
    id: 'JP_7',
    axis: 'JP',
    tag: '複数タスク',
    stem: '複数のことを並行して進めるより、一つ終わらせてから次に移りたいタイプだ。',
    leftLabel: '判断（J）',
    rightLabel: '知覚（P）',
    reversed: false,
  },
  {
    id: 'JP_8',
    axis: 'JP',
    tag: '即興・アドリブ',
    stem: '準備なしでその場の流れに乗っていくほうが、かえってうまくいくことが多いと感じる。',
    leftLabel: '判断（J）',
    rightLabel: '知覚（P）',
    reversed: true,  // ⚠ 逆転項目：「そう」と答えるのはP寄り
  },
];
```

---

## 5. スコアリングロジック（参考実装）

現行のスコアリング関数をこの実装に置き換える。

```js
// 回答値: 0=強くそう, 1=ややそう, 2=ややちがう, 3=強くちがう
export function calcScore(answers) {
  // answers: { [questionId]: 0|1|2|3 }

  const axisScores = { EI: 0, SN: 0, TF: 0, JP: 0 };

  for (const q of questions) {
    const value = answers[q.id];
    if (value === undefined) continue;

    // 逆転項目は反転
    const point = q.reversed ? (3 - value) : value;
    axisScores[q.axis] += point;
  }

  // 各軸の判定（13点以上 → 左極）
  return {
    E: axisScores.EI >= 13, // true=E, false=I
    S: axisScores.SN >= 13, // true=S, false=N
    T: axisScores.TF >= 13, // true=T, false=F
    J: axisScores.JP >= 13, // true=J, false=P
    scores: axisScores,     // 傾向の強さに使いたい場合
  };
}

// 16タイプ文字列を返す
export function getTypeName(result) {
  return (result.E ? 'E' : 'I')
       + (result.S ? 'S' : 'N')
       + (result.T ? 'T' : 'F')
       + (result.J ? 'J' : 'P');
}
```

---

## 6. UIの変更点

### 質問表示コンポーネント

現行の「4つの選択肢ボタンを縦に並べる」UIを以下に変更する。

```
┌────────────────────────────────────────────┐
│  Q8 / 32                                   │
│                                            │
│  人が多い場所や賑やかな集まりのあと、      │
│  消耗するより充実感のほうが残る。          │
│                                            │
│  外向（E）寄り  ←────────────→  内向（I）寄り │
│                                            │
│  [強くそう] [ややそう] [ややちがう] [強くちがう] │
└────────────────────────────────────────────┘
```

- ボタンは横並び4つ（横幅均等）
- 左ボタンほど左極（E/S/T/J）寄り、右ボタンほど右極（I/N/F/P）寄り
- 選択済みのボタンはハイライト表示
- 進捗表示は「8 / 32」形式

### 回答値の定義

```js
const ANSWER_VALUES = {
  '強くそう':    0,
  'ややそう':    1,
  'ややちがう':  2,
  '強くちがう':  3,
};
```

---

## 7. 実装チェックリスト

Claude Codeは以下の順番で実装すること。

1. 質問データファイルを上記セクション4の内容に丸ごと置き換える
2. スコアリング関数をセクション5の実装に置き換える
3. 診断UIコンポーネントの選択肢ボタンを4段階横並びに変更する
4. 進捗表示を「○ / 32」に更新する
5. 動作確認：全問「強くそう」で回答 → ESTJ になることを確認する
   （逆転4問があるため各軸スコアは24点にならないが、全軸13点超えでESTJになる）
6. 動作確認：全問「強くちがう」で回答 → INFP になることを確認する

---

## 8. 変更しないもの

- 16タイプの処方箋データ（2,016件）
- バイアス追加メッセージ（128件）
- 偉人マッピング（16名）
- 結果画面のレイアウト
- Netlifyデプロイ設定
