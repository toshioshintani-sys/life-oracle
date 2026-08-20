// バイアス情報マスター
// magazineUrl: そのバイアスの note マガジン（2026-08-06 追加）。
//   1記事ではなく「そのバイアスを扱った記事すべて」に飛ぶ。既に公開済みのマガジンなので
//   noteScheduledAt の日付ゲートは不要（＝記事があるのに非表示になる問題が起きない）。
//   収録記事は週次タスク LifeOracle_MagazineSync_Weekly が自動で増やすため、アプリ側の更新は不要。
// noteUrl: Gachijin series day1 URLs（Supabase job_outputs より取得）。magazineUrl が無い場合のフォールバック。
// noteScheduledAt: note.com での公開予定日時（UTC）。noteUrl を使う場合のみ有効

// talkLine: 診断結果のカードに出す「人に話せる一行」（2026-08-21 追加）。
//   知った名前を誰かに話したくなる＝social currency が拡散の主因（Berger）。
//   名前だけ覚えても会話では使えないので、そのまま言える台詞の形で渡す。
export const biasInfo = {
  B1:  { name: '損失回避',         short: '失うことへの恐れが強い',               messageKey: 'loss_high',      description: '得ることより失うことを約2倍重く感じるバイアス。リスクを避けすぎたり、手放せないものを抱えすぎたりしやすい。',       magazineUrl: 'https://note.com/lifeoraclejp/m/mb942acddd918', noteUrl: 'https://note.com/lifeoraclejp/n/nfc6d75e799c3', noteScheduledAt: '2026-06-03T22:00:00Z', talkLine: '得するよりも、損したくないが勝ってるのかも' },
  B2:  { name: '現在バイアス',     short: '今この瞬間を優先しすぎる',             messageKey: 'present_low',    description: '将来の大きな利益より、今すぐの小さな満足を選んでしまうバイアス。先延ばしや衝動的な行動につながりやすい。',         magazineUrl: 'https://note.com/lifeoraclejp/m/md859ed8f1954', noteUrl: 'https://note.com/lifeoraclejp/n/na3974f06edb5', noteScheduledAt: '2026-06-07T22:00:00Z', talkLine: 'それ、未来の自分に押しつけてるだけかもね' },
  B3:  { name: '確証バイアス',     short: '信じたいものだけを集める',             messageKey: 'confirmation',   description: '自分の考えを支持する情報を無意識に優先するバイアス。反証を見落としやすく、判断が偏ることがある。',             magazineUrl: 'https://note.com/lifeoraclejp/m/mda7856cbb8fb', noteUrl: 'https://note.com/lifeoraclejp/n/n485f749acbca', noteScheduledAt: '2026-06-28T22:00:00Z', talkLine: 'そう思って見てるから、そう見えてるやつだ' },
  B4:  { name: '同調バイアス',     short: '周囲の流れに乗りやすい',               messageKey: 'social',         description: '多数派の意見や行動に合わせようとするバイアス。社会的なつながりを大切にする反面、自分の判断が薄れやすい。',       magazineUrl: 'https://note.com/lifeoraclejp/m/m414c2fb6c598', noteUrl: 'https://note.com/lifeoraclejp/n/nfc531fc8b597', noteScheduledAt: '2026-06-24T22:00:00Z', talkLine: '全員が賛成した会議がいちばん危ないらしいよ' },
  B5:  { name: '過信バイアス',     short: '自分を実力以上に見積もる',             messageKey: 'overconfidence', description: '自分の能力や判断を平均より高く見積もるバイアス。行動力につながる一方、リスク管理が甘くなりやすい。',           magazineUrl: 'https://note.com/lifeoraclejp/m/m96fe663f6a04', noteUrl: 'https://note.com/lifeoraclejp/n/ne1d6aa758188', noteScheduledAt: '2026-09-23T22:00:00Z', talkLine: '自分は平均より上だと思う人、実は大多数らしい' },
  B6:  { name: '現状維持バイアス', short: '変化より現状を選びやすい',             messageKey: 'status_quo',     description: '慣れ親しんだ状態を変えることへの抵抗感。安定志向の反面、必要な変化を先送りにしやすい。',                     magazineUrl: 'https://note.com/lifeoraclejp/m/ma272c44afad6', noteUrl: 'https://note.com/lifeoraclejp/n/n2de78db1732c', noteScheduledAt: '2026-07-01T22:00:00Z', talkLine: '変えない、というのも立派に選んでることになる' },
  B7:  { name: 'アンカリング',     short: '最初の数字・情報に引っ張られる',       messageKey: 'anchoring',      description: '最初に提示された情報を基準にして判断するバイアス。価格交渉や比較判断で無意識に影響を受けやすい。',             magazineUrl: 'https://note.com/lifeoraclejp/m/m1f4abe78da35', noteUrl: 'https://note.com/lifeoraclejp/n/n791ff7bbc4ad', noteScheduledAt: '2026-06-10T22:00:00Z', talkLine: '最初に見た値段に引っぱられてない？' },
  B8:  { name: 'サンクコスト効果', short: 'これまでの投資が惜しくて手放せない',   messageKey: 'sunk_cost',      description: 'すでに使った時間・お金・労力に引きずられて、見切る判断が遅れるバイアス。',                                   magazineUrl: 'https://note.com/lifeoraclejp/m/m5d953903008d', noteUrl: 'https://note.com/lifeoraclejp/n/n12e8884c0fe2', noteScheduledAt: '2026-05-31T22:00:00Z', talkLine: 'それ、もったいないから続けてるだけかも' },
  B9:  { name: 'フレーミング効果', short: '言い方が変わると印象が変わる',         messageKey: 'framing',        description: '同じ内容でも、表現の枠組み次第で受け取り方が大きく変わるバイアス。',                                         magazineUrl: 'https://note.com/lifeoraclejp/m/mae79a2b7792e', noteUrl: 'https://note.com/lifeoraclejp/n/nee0e6312fd01', noteScheduledAt: '2026-06-14T22:00:00Z', talkLine: '同じ話でも、言い方を変えると通ることあるよ' },
  B10: { name: '後知恵バイアス',   short: '結果を知ってから「やっぱりそうだと思った」', messageKey: 'hindsight', description: '出来事の結末を知った後で、まるで前から予測できていたかのように感じてしまうバイアス。',                         magazineUrl: 'https://note.com/lifeoraclejp/m/mbff55e9aba6f', noteUrl: 'https://note.com/lifeoraclejp/n/n5b8d496a189e', noteScheduledAt: '2026-10-28T22:00:00Z', talkLine: '終わってから言うことは、だいたい当たる' },
  B11: { name: 'ハロー効果',       short: '一つの目立つ印象が全体評価に広がる',   messageKey: 'halo',           description: '見た目・肩書き・第一印象などの一つの特徴が、他の側面の評価まで引っ張ってしまうバイアス。',                     magazineUrl: 'https://note.com/lifeoraclejp/m/m4a858200eaa9', noteUrl: 'https://note.com/lifeoraclejp/n/ne84d052da664', noteScheduledAt: '2026-07-12T22:00:00Z', talkLine: '話がうまい人が仕事もできる、とは限らないらしい' },
  B12: { name: '認知的不協和',     short: '自分の行動と気持ちのズレを正当化したくなる', messageKey: 'dissonance', description: '行動と信念が食い違うとき、不快感を解消するために考え方の方を変えてしまうバイアス。',                         magazineUrl: 'https://note.com/lifeoraclejp/m/m151779b9e37a', noteUrl: 'https://note.com/lifeoraclejp/n/n4968406c2fd1', noteScheduledAt: '2026-09-27T22:00:00Z', talkLine: '納得したんじゃなくて、納得したことにしてるのかも' },

  // 2026-08-21 追加：noteのマガジン35個に対しアプリが12個しか測れていなかったため、
  //   なじみのある8個を追加。型別メッセージ(bias_messages.json)は未作成だが、
  //   結果画面は msg ?? description のフォールバックがあるので description が表示される。
  B13: { name: '感情ヒューリスティック', short: '「なんとなく」で決めてしまう', messageKey: 'affect', description: '好き嫌いや気分が、論理的な検討より先に判断を決めてしまうバイアス。素早く動ける反面、条件の良し悪しを見落としやすい。', magazineUrl: 'https://note.com/lifeoraclejp/m/m9dfb36023446', talkLine: '理由は後づけで、先に好き嫌いが決まってるんだって' },
  B14: { name: '計画錯誤', short: '見積もりがいつも甘くなる', messageKey: 'planning', description: 'かかる時間や費用を実際より少なく見積もるバイアス。前向きに動き出せる一方、締切間際に無理が集中しやすい。', magazineUrl: 'https://note.com/lifeoraclejp/m/m24d7faa1e582', talkLine: '見積もりが甘いのは性格じゃなくて、人間の仕様らしい' },
  B15: { name: 'ツァイガルニク効果', short: '終わっていないことが頭に残る', messageKey: 'zeigarnik', description: '完了したことより中断していることのほうが記憶に残り続ける現象。やり遂げる力になる反面、休んでいても頭が休まらない。', magazineUrl: 'https://note.com/lifeoraclejp/m/mb45aecf0697b', talkLine: '途中で止めたことほど、頭に残り続けるんだって' },
  B16: { name: 'スポットライト効果', short: '自分への注目を大きく見積もる', messageKey: 'spotlight', description: '実際より多くの人が自分を見ていると感じるバイアス。身だしなみや言動が整う反面、失敗を過剰に引きずりやすい。', magazineUrl: 'https://note.com/lifeoraclejp/m/m03b8a4af0b6a', talkLine: 'みんな、思ってるほど人のこと見てないよ' },
  B17: { name: 'バンドワゴン効果', short: '多くの人が選ぶものに寄っていく', messageKey: 'bandwagon', description: '多数派であること自体が選ぶ理由になるバイアス。流れに乗る力がある反面、自分の基準が薄れやすい。', magazineUrl: 'https://note.com/lifeoraclejp/m/m9bcab3fd344a', talkLine: '並んでるから並ぶ、っていうやつだね' },
  B18: { name: 'バーナム効果', short: '誰にでも当てはまる言葉が自分宛てに聞こえる', messageKey: 'barnum', description: '一般的な記述を自分だけへのメッセージとして受け取る現象。素直に受け止められる反面、根拠の薄い言葉にも動かされやすい。', magazineUrl: 'https://note.com/lifeoraclejp/m/m47d0bf063412', talkLine: '占いが当たるのは、誰にでも当たるように書いてあるから' },
  B19: { name: 'ダニング・クルーガー効果', short: '知識が浅いほど自信が高くなる', messageKey: 'dunning', description: '習熟の初期ほど自分の理解度を高く見積もるバイアス。行動が早い反面、基礎の確認を飛ばしやすい。', magazineUrl: 'https://note.com/lifeoraclejp/m/mb86ee292fc2d', talkLine: 'かじり始めた頃が、いちばん自信あるらしいよ' },
  B20: { name: '正常性バイアス', short: '「自分は大丈夫」と危険を小さく見る', messageKey: 'normalcy', description: '異常や警告を平常の範囲に収めてしまうバイアス。動揺せずにいられる反面、逃げ時・休み時を逃しやすい。周りが動かないと自分も動かない集団状況で強く出る。', magazineUrl: 'https://note.com/lifeoraclejp/m/m715f2a9b2c81', talkLine: 'みんな逃げないから逃げない、がいちばん危ない' },
};
