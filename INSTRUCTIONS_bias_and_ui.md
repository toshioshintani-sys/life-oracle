# ライフオラクル：バイアス測定 ＋ 結果画面UI 統合実装指示書

## 概要

1. ユング診断（32問）完了後、バイアス測定（16問）を追加する
2. 上位2バイアスを特定して結果画面に表示する
3. 結果画面のレイアウトを整理し、シェアボタンを追加する

**既存の処方箋2,016件・バイアス追加メッセージ128件・偉人データは変更しない。**

---

## STEP 1：バイアス測定の追加

### 1-1. 診断フローの変更

```
変更前：ユング32問 → 結果表示
変更後：ユング32問 → バイアス16問 → 結果表示
```

ユング32問が終わったら自動的にバイアス測定フェーズに移行する。
進捗表示はフェーズを分けて表示する。

```
ユング診断フェーズ：  「Q1 / 32」
バイアス測定フェーズ：「Q1 / 16」+ サブタイトル「あなたのクセを調べます」
```

### 1-2. バイアス質問データ

以下を新ファイル `src/data/biasQuestions.js`（または既存の構成に合わせたパス）として追加する。

```js
export const biasQuestions = [

  // ── B1：損失回避 ──────────────────────────────────────
  {
    id: 'B1_1',
    bias: 'B1',
    stem: '何かを手放すことを考えると、同じ価値のものを手に入れることより気になってしまう。',
    reversed: false,
  },
  {
    id: 'B1_2',
    bias: 'B1',
    stem: 'うまくいっていることを変えようとするとき、失敗したときのことが頭をよぎって踏み出しにくい。',
    reversed: false,
  },

  // ── B2：現在バイアス ───────────────────────────────────
  {
    id: 'B2_1',
    bias: 'B2',
    stem: '「あとでやろう」と思ったことが、結局そのままになっていることがよくある。',
    reversed: false,
  },
  {
    id: 'B2_2',
    bias: 'B2',
    stem: '将来のために我慢するより、今の自分が楽しめることを優先してしまいがちだ。',
    reversed: false,
  },

  // ── B3：確証バイアス ───────────────────────────────────
  {
    id: 'B3_1',
    bias: 'B3',
    stem: '自分の考えが正しいと思うと、反対意見より賛成意見のほうに目がいきやすい。',
    reversed: false,
  },
  {
    id: 'B3_2',
    bias: 'B3',
    stem: '何かを調べるとき、気づくと自分が信じていることを裏付ける情報ばかり集めている。',
    reversed: false,
  },

  // ── B4：同調バイアス ───────────────────────────────────
  {
    id: 'B4_1',
    bias: 'B4',
    stem: '周りの人が「いい」と言っているものは、自分も試してみたくなる。',
    reversed: false,
  },
  {
    id: 'B4_2',
    bias: 'B4',
    stem: '自分だけ違う意見を持っていると、正しいと思っていても言い出しにくくなる。',
    reversed: false,
  },

  // ── B5：過信バイアス ───────────────────────────────────
  {
    id: 'B5_1',
    bias: 'B5',
    stem: '自分の判断は、平均的な人よりだいたい正確だと思う。',
    reversed: false,
  },
  {
    id: 'B5_2',
    bias: 'B5',
    stem: '計画を立てるとき、想定外のトラブルは「自分には起きにくい」と感じることが多い。',
    reversed: false,
  },

  // ── B6：現状維持バイアス ───────────────────────────────
  {
    id: 'B6_1',
    bias: 'B6',
    stem: '新しいやり方に変えようとするとき、慣れた方法のほうが安心だという気持ちが勝ちやすい。',
    reversed: false,
  },
  {
    id: 'B6_2',
    bias: 'B6',
    stem: '何かを変えるより、今のまま続けるほうが「無難」に感じることが多い。',
    reversed: false,
  },

  // ── B7：アンカリング ───────────────────────────────────
  {
    id: 'B7_1',
    bias: 'B7',
    stem: '最初に見た値段や数字が基準になって、あとから出てきた情報と比べてしまうことがある。',
    reversed: false,
  },
  {
    id: 'B7_2',
    bias: 'B7',
    stem: '交渉や比較のとき、最初に提示された条件が頭に残って、そこから考えてしまう。',
    reversed: false,
  },

  // ── B8：感情ヒューリスティック ─────────────────────────
  {
    id: 'B8_1',
    bias: 'B8',
    stem: '気分がいいときと悪いときで、同じ出来事の受け止め方がかなり変わる。',
    reversed: false,
  },
  {
    id: 'B8_2',
    bias: 'B8',
    stem: '「なんとなく嫌な感じがする」という直感で、物事の良し悪しを判断することがある。',
    reversed: false,
  },
];
```

### 1-3. バイアススコアリング関数

既存のスコアリングファイルに以下を追加する。

```js
// 回答値：0=強くそう, 1=ややそう, 2=ややちがう, 3=強くちがう

export function calcBiasScores(answers) {
  // answers: { [questionId]: 0|1|2|3 }

  const scores = { B1: 0, B2: 0, B3: 0, B4: 0, B5: 0, B6: 0, B7: 0, B8: 0 };

  for (const q of biasQuestions) {
    const value = answers[q.id];
    if (value === undefined) continue;
    const point = q.reversed ? (3 - value) : value;
    scores[q.bias] += point;
  }

  // スコア降順でソート。同点はID順（B1優先）
  const ranked = Object.entries(scores)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  return {
    scores,
    top2: [ranked[0][0], ranked[1][0]], // 例: ['B3', 'B1']
  };
}
```

### 1-4. バイアス情報データ

既存の定数ファイルに追加する。

```js
export const biasInfo = {
  B1: {
    name: '損失回避',
    short: '失うことへの恐れが強い',
    description: '得ることより失うことを約2倍重く感じるバイアス。リスクを避けすぎたり、手放せないものを抱えすぎたりしやすい。',
  },
  B2: {
    name: '現在バイアス',
    short: '今この瞬間を優先しすぎる',
    description: '将来の大きな利益より、今すぐの小さな満足を選んでしまうバイアス。先延ばしや衝動的な行動につながりやすい。',
  },
  B3: {
    name: '確証バイアス',
    short: '信じたいものだけを集める',
    description: '自分の考えを支持する情報を無意識に優先するバイアス。反証を見落としやすく、判断が偏ることがある。',
  },
  B4: {
    name: '同調バイアス',
    short: '周囲の流れに乗りやすい',
    description: '多数派の意見や行動に合わせようとするバイアス。社会的なつながりを大切にする反面、自分の判断が薄れやすい。',
  },
  B5: {
    name: '過信バイアス',
    short: '自分を実力以上に見積もる',
    description: '自分の能力や判断を平均より高く見積もるバイアス。行動力につながる一方、リスク管理が甘くなりやすい。',
  },
  B6: {
    name: '現状維持バイアス',
    short: '変化より現状を選びやすい',
    description: '慣れ親しんだ状態を変えることへの抵抗感。安定志向の反面、必要な変化を先送りにしやすい。',
  },
  B7: {
    name: 'アンカリング',
    short: '最初の数字・情報に引っ張られる',
    description: '最初に提示された情報を基準にして判断するバイアス。価格交渉や比較判断で無意識に影響を受けやすい。',
  },
  B8: {
    name: '感情ヒューリスティック',
    short: '気分が判断を左右しやすい',
    description: '論理より感情・直感で判断するバイアス。直感が当たることも多い一方、気分に判断が振り回されやすい。',
  },
};
```

---

## STEP 2：結果画面のUI整理

### 2-1. 画面構成

以下の順番でセクションを並べる。

```
┌─────────────────────────────┐
│ ① タイプ表示                 │
│    ENFP  直観と情熱の探求者   │
│    ○○と同じタイプ            │
├─────────────────────────────┤
│ ② 職種・年代セレクター        │  ← 現行のまま
├─────────────────────────────┤
│ ③ 処方箋                     │  ← 現行のまま
├─────────────────────────────┤
│ ④ あなたのクセ（バイアス）    │  ← 今回追加
│    1位：確証バイアス          │
│    2位：損失回避              │
├─────────────────────────────┤
│ ⑤ シェアボタン               │  ← 今回追加
└─────────────────────────────┘
```

### 2-2. ① タイプ表示エリア

タイプ名に加えて、キャッチコピーを1行追加する。

```js
export const typeLabels = {
  ENFP: '直観と情熱の探求者',
  INFP: '理想を追い続ける詩人',
  ENFJ: '人を導くカリスマ',
  INFJ: '静かなるビジョナリー',
  ENTP: 'アイデアが止まらない論客',
  INTP: '理論を極める哲学者',
  ENTJ: '目標を貫く指揮官',
  INTJ: '孤高の戦略家',
  ESFP: '場を明るくするエンターテイナー',
  ISFP: '感性豊かなアーティスト',
  ESFJ: 'みんなの世話焼きリーダー',
  ISFJ: '縁の下の力持ち',
  ESTP: 'リスクを楽しむ行動派',
  ISTP: '黙って手を動かす職人',
  ESTJ: '秩序を守る現場監督',
  ISTJ: '堅実に積み上げる責任者',
};
```

表示イメージ：

```jsx
<div className="type-header">
  <div className="type-name">{typeName}</div>
  <div className="type-label">{typeLabels[typeName]}</div>
  <div className="type-famous">{famousPeople[typeName].name}と同じタイプ</div>
</div>
```

### 2-3. ④ バイアスエリア

上位2バイアスをカード形式で表示する。

```jsx
<section className="bias-section">
  <h2>あなたの思考のクセ</h2>
  {top2Biases.map((biasId, index) => (
    <div key={biasId} className="bias-card">
      <div className="bias-card-header">
        <span className="bias-rank">{index + 1}位のクセ</span>
        <span className="bias-name">{biasInfo[biasId].name}</span>
        <span className="bias-short">{biasInfo[biasId].short}</span>
      </div>
      <p className="bias-message">
        {biasMessages[`${typeName}_${biasId}`]}
      </p>
    </div>
  ))}
</section>
```

**biasMessages のキー命名規則は既存の実装に合わせること。**
現行のキーが `${typeName}_${biasId}` と異なる場合は既存に揃える。

### 2-4. ⑤ シェアボタン

```jsx
<section className="share-section">
  <button
    className="share-button"
    onClick={() => {
      const text = [
        '【ライフオラクル診断結果】',
        `タイプ：${typeName}（${typeLabels[typeName]}）`,
        `思考のクセ：${biasInfo[top2Biases[0]].name} / ${biasInfo[top2Biases[1]].name}`,
        '',
        '🔮 ライフオラクルで診断する',
        'https://meek-alfajores-ef7e71.netlify.app/',
      ].join('\n');
      navigator.clipboard.writeText(text)
        .then(() => alert('コピーしました！'));
    }}
  >
    結果をコピーする
  </button>

  <button
    className="retry-button"
    onClick={() => window.location.reload()}
  >
    もう一度診断する
  </button>
</section>
```

---

## STEP 3：実装チェックリスト

以下の順番で進めること。

1. `biasQuestions.js` を新規作成し、上記STEP 1-2のデータを書き込む
2. `calcBiasScores` 関数を既存のスコアリングファイルに追加する
3. `biasInfo` を既存の定数ファイルに追加する
4. 診断フローにバイアス測定フェーズを追加する（ユング32問終了後に自動移行）
5. `typeLabels` を定数として追加する
6. 結果画面に④バイアスエリア・⑤シェアボタンを追加する
7. 動作確認：
   - ユング32問完了 → バイアス16問に自動移行することを確認
   - 全問「強くそう」で回答 → いずれかのバイアスが上位2つに表示されることを確認
   - 「結果をコピーする」ボタンでテキストがクリップボードに入ることを確認
   - 「もう一度診断する」ボタンで最初の画面に戻ることを確認

---

## 変更しないもの

- ユング32問の質問データ・スコアリング
- 処方箋2,016件の内容
- バイアス追加メッセージ128件の内容（表示方法は変更、内容は変更しない）
- 偉人マッピング16名の内容
- 職種・年代セレクターのロジック
- Netlifyデプロイ設定
