// バイアス情報マスター（life-oracle から移植・変更なし）
// noteUrl: Gachijin series day1 URLs (Supabase job_outputs より取得)

export const biasInfo = {
  B1:  { name: '損失回避',       short: '失うことへの恐れが強い',               messageKey: 'loss_high',       description: '得ることより失うことを約2倍重く感じるバイアス。リスクを避けすぎたり、手放せないものを抱えすぎたりしやすい。',       noteUrl: 'https://note.com/lifeoraclejp/n/nfc6d75e799c3' },
  B2:  { name: '現在バイアス',   short: '今この瞬間を優先しすぎる',             messageKey: 'present_low',     description: '将来の大きな利益より、今すぐの小さな満足を選んでしまうバイアス。先延ばしや衝動的な行動につながりやすい。',         noteUrl: 'https://note.com/lifeoraclejp/n/na3974f06edb5' },
  B3:  { name: '確証バイアス',   short: '信じたいものだけを集める',             messageKey: 'confirmation',    description: '自分の考えを支持する情報を無意識に優先するバイアス。反証を見落としやすく、判断が偏ることがある。',             noteUrl: 'https://note.com/lifeoraclejp/n/n485f749acbca' },
  B4:  { name: '同調バイアス',   short: '周囲の流れに乗りやすい',               messageKey: 'social',          description: '多数派の意見や行動に合わせようとするバイアス。社会的なつながりを大切にする反面、自分の判断が薄れやすい。',       noteUrl: 'https://note.com/lifeoraclejp/n/nfc531fc8b597' },
  B5:  { name: '過信バイアス',   short: '自分を実力以上に見積もる',             messageKey: 'overconfidence',  description: '自分の能力や判断を平均より高く見積もるバイアス。行動力につながる一方、リスク管理が甘くなりやすい。',           noteUrl: 'https://note.com/lifeoraclejp/n/ne1d6aa758188' },
  B6:  { name: '現状維持バイアス', short: '変化より現状を選びやすい',           messageKey: 'status_quo',      description: '慣れ親しんだ状態を変えることへの抵抗感。安定志向の反面、必要な変化を先送りにしやすい。',                     noteUrl: 'https://note.com/lifeoraclejp/n/n2de78db1732c' },
  B7:  { name: 'アンカリング',   short: '最初の数字・情報に引っ張られる',       messageKey: 'anchoring',       description: '最初に提示された情報を基準にして判断するバイアス。価格交渉や比較判断で無意識に影響を受けやすい。',             noteUrl: 'https://note.com/lifeoraclejp/n/n791ff7bbc4ad' },
  B8:  { name: 'サンクコスト効果', short: 'これまでの投資が惜しくて手放せない', messageKey: 'sunk_cost',       description: 'すでに使った時間・お金・労力に引きずられて、見切る判断が遅れるバイアス。',                                   noteUrl: 'https://note.com/lifeoraclejp/n/n12e8884c0fe2' },
  B9:  { name: 'フレーミング効果', short: '言い方が変わると印象が変わる',       messageKey: 'framing',         description: '同じ内容でも、表現の枠組み次第で受け取り方が大きく変わるバイアス。',                                         noteUrl: 'https://note.com/lifeoraclejp/n/nee0e6312fd01' },
  B10: { name: '後知恵バイアス', short: '結果を知ってから「やっぱりそうだと思った」', messageKey: 'hindsight',  description: '出来事の結末を知った後で、まるで前から予測できていたかのように感じてしまうバイアス。',                         noteUrl: 'https://note.com/lifeoraclejp/n/n5b8d496a189e' },
  B11: { name: 'ハロー効果',     short: '一つの目立つ印象が全体評価に広がる',   messageKey: 'halo',            description: '見た目・肩書き・第一印象などの一つの特徴が、他の側面の評価まで引っ張ってしまうバイアス。',                     noteUrl: 'https://note.com/lifeoraclejp/n/ne84d052da664' },
  B12: { name: '認知的不協和',   short: '自分の行動と気持ちのズレを正当化したくなる', messageKey: 'dissonance', description: '行動と信念が食い違うとき、不快感を解消するために考え方の方を変えてしまうバイアス。',                         noteUrl: 'https://note.com/lifeoraclejp/n/n4968406c2fd1' },
};
