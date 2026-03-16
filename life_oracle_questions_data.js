/**
 * 診断質問データ（life_oracle_questions.jsx から抽出）
 * アプリではこれを import して使用する
 */
export const QUESTIONS = {
  jung: [
    { id: "J1", phase: "jung", theme: "意思決定", question: "仕事や生活で重要な決断を迫られたとき、あなたが一番頼りにするのは？", options: [{ label: "A", text: "データや実績に基づいた論理的な分析", type: "Te" }, { label: "B", text: "その場でひらめく「なんとなく正しい」という感覚", type: "Ni" }, { label: "C", text: "周りの人への影響や、関係が壊れないかどうか", type: "Fe" }, { label: "D", text: "これまでの経験や、実際に試してみた結果", type: "Si" }] },
    { id: "J2", phase: "jung", theme: "エネルギーの回復", question: "疲れてへとへとのとき、あなたが自然と求めるのは？", options: [{ label: "A", text: "一人で静かに過ごし、読書や内省で回復する", type: "Ni" }, { label: "B", text: "友人や家族と話して、賑やかな空気に包まれる", type: "Fe" }, { label: "C", text: "好きなことに没頭して、五感を研ぎ澄ます", type: "Se" }, { label: "D", text: "新しいアイデアを妄想したり、可能性を膨らませる", type: "Ne" }] },
    { id: "J3", phase: "jung", theme: "他者への関わり方", question: "チームや友人同士で意見が食い違ったとき、あなたはどうする？", options: [{ label: "A", text: "論理的にもっとも筋の通る結論を出して、みんなに提示する", type: "Te" }, { label: "B", text: "みんなが納得できる着地点を、話し合いながら探る", type: "Fe" }, { label: "C", text: "自分が正しいと思うことを、譲らずに伝える", type: "Fi" }, { label: "D", text: "「とりあえずやってみよう」と、まず動いてみせる", type: "Se" }] },
    { id: "J4", phase: "jung", theme: "時間軸の感覚", question: "「未来」についてどう感じることが多いですか？", options: [{ label: "A", text: "鮮明なビジョンがあり、そこへ向かう確信がある", type: "Ni" }, { label: "B", text: "いろんな可能性が広がって見えて、ワクワクする", type: "Ne" }, { label: "C", text: "今の積み重ねが未来をつくると感じ、着実に備える", type: "Si" }, { label: "D", text: "今この瞬間が大事で、未来はあまり考えない", type: "Se" }] },
    { id: "J5", phase: "jung", theme: "学びのスタイル", question: "新しいスキルや知識を身につけるとき、あなたに合うのは？", options: [{ label: "A", text: "仕組みや理論をしっかり理解してから、手を動かす", type: "Ti" }, { label: "B", text: "まずやってみて、体で覚えていく", type: "Se" }, { label: "C", text: "全体像や「なぜこれが大切か」を掴んでから始める", type: "Ni" }, { label: "D", text: "いろんな角度から調べて、関連づけながら理解する", type: "Ne" }] },
    { id: "J6", phase: "jung", theme: "葛藤への反応", question: "誰かと意見がぶつかったとき、あなたはまず何をしたくなる？", options: [{ label: "A", text: "相手の論理の穴を整理して、筋の通る説明を求める", type: "Ti" }, { label: "B", text: "相手がなぜそう思うのか、気持ちを理解しようとする", type: "Fe" }, { label: "C", text: "自分の信念が揺らいでいないか、内側で確認する", type: "Fi" }, { label: "D", text: "早く結論を出して、次のステップに進みたいと思う", type: "Te" }] },
    { id: "J7", phase: "jung", theme: "創造性の源泉", question: "「いいアイデアが浮かぶ」のはどんなとき？", options: [{ label: "A", text: "シャワーや散歩など、ぼんやりしているとき突然来る", type: "Ni" }, { label: "B", text: "人と話しているうちに、どんどん発展していく", type: "Ne" }, { label: "C", text: "問題をじっくり分析していると、解が見えてくる", type: "Ti" }, { label: "D", text: "実際に手を動かしながら、試行錯誤の中で生まれる", type: "Se" }] },
    { id: "J8", phase: "jung", theme: "リーダーシップ", question: "チームを動かすとき、あなたが自然とやるのは？", options: [{ label: "A", text: "明確な計画と役割を決め、効率よく進める", type: "Te" }, { label: "B", text: "一人ひとりの気持ちに寄り添い、やる気を引き出す", type: "Fe" }, { label: "C", text: "「こうあるべき」というビジョンを掲げて引っ張る", type: "Ni" }, { label: "D", text: "自分が率先して動き、背中で示す", type: "Se" }] },
    { id: "J9", phase: "jung", theme: "記憶と過去", question: "これまでの経験や思い出について、あなたに当てはまるのは？", options: [{ label: "A", text: "大事な記憶を大切に持ち、今の判断にも活かしている", type: "Si" }, { label: "B", text: "過去より「これから先どうなるか」に意識が向きがち", type: "Ne" }, { label: "C", text: "昔の感情体験が、今の自分の価値観の土台になっている", type: "Fi" }, { label: "D", text: "過去を分析して、パターンや法則を見つけて活用する", type: "Ti" }] },
    { id: "J10", phase: "jung", theme: "感情の扱い方", question: "自分の感情について、最も当てはまるのは？", options: [{ label: "A", text: "感情は内側で深く感じるが、外には見せないことが多い", type: "Fi" }, { label: "B", text: "感情は表情や言葉で自然と外に出る", type: "Fe" }, { label: "C", text: "感情より先に「論理的に何が正しいか」を考える", type: "Ti" }, { label: "D", text: "感情は今この瞬間の反応として素直に表れる", type: "Se" }] },
    { id: "J11", phase: "jung", theme: "完璧主義とスピード", question: "仕事やプロジェクトの進め方で自分に近いのは？", options: [{ label: "A", text: "完璧に仕上げてから公開・提出したい", type: "Ti" }, { label: "B", text: "まず出してみて、フィードバックで改善する", type: "Se" }, { label: "C", text: "全体のビジョンが固まらないと動けない", type: "Ni" }, { label: "D", text: "みんなが納得した状態で進めたい", type: "Fe" }] },
    { id: "J12", phase: "jung", theme: "孤独と社会性", question: "「一人の時間」と「人といる時間」、どちらがあなたらしい？", options: [{ label: "A", text: "一人の時間こそ充実する。自分の内側と向き合える", type: "Fi" }, { label: "B", text: "人といるとエネルギーが湧く。会話でアイデアが広がる", type: "Fe" }, { label: "C", text: "一人でいながら、先のことや可能性を想像するのが好き", type: "Ni" }, { label: "D", text: "どちらも必要。メリハリをつけて切り替えている", type: "Si" }] },
    { id: "J13", phase: "jung", theme: "変化への適応", question: "予期しない変化が起きたとき、あなたの第一反応は？", options: [{ label: "A", text: "まず全体状況を論理的に整理し、対策を立てる", type: "Te" }, { label: "B", text: "この変化が何を意味するのか、深く考え込む", type: "Ni" }, { label: "C", text: "とにかく動きながら状況を掴んでいく", type: "Se" }, { label: "D", text: "周りの人の様子を確認しながら、一緒に乗り越える", type: "Fe" }] },
    { id: "J14", phase: "jung", theme: "批判への反応", question: "自分の仕事や考えを批判されたとき、どう感じる？", options: [{ label: "A", text: "批判の論理的根拠を確認し、正しければ改善する", type: "Ti" }, { label: "B", text: "自分の価値観や信念が否定された気がして傷つく", type: "Fi" }, { label: "C", text: "相手がなぜそう思うのかを理解しようとする", type: "Fe" }, { label: "D", text: "悔しいが、結果で証明しようとすぐ動く", type: "Se" }] },
    { id: "J15", phase: "jung", theme: "使命感", question: "あなたが最も「生きている」と感じる瞬間は？", options: [{ label: "A", text: "困難な問題を解き明かし、真実に到達したとき", type: "Ti" }, { label: "B", text: "誰かの人生にとってプラスになることができたとき", type: "Fe" }, { label: "C", text: "自分のビジョンが現実になっていくのを見るとき", type: "Ni" }, { label: "D", text: "今この瞬間に全力を注ぎ、完全に没入しているとき", type: "Se" }] },
  ],
  bias: [
    { id: "B1", phase: "bias", theme: "時間割引", question: "副業で月5万円を稼ぐチャンスが来ました。ただし最初の3ヶ月は収支がマイナスになるかもしれません。あなたは？", options: [{ label: "A", text: "すぐに始める。やらない後悔より、やる後悔", type: "present_low" }, { label: "B", text: "3ヶ月後の収支シミュレーションを徹底的に調べてから決める", type: "confirmation" }, { label: "C", text: "同じことをした知人の話を聞いてから判断する", type: "social" }, { label: "D", text: "今の収入が安定しているうちは動かない", type: "loss_high" }] },
    { id: "B2", phase: "bias", theme: "損失回避", question: "投資した株が-20%になっています。専門家は「回復の見込みあり」と言っています。あなたは？", options: [{ label: "A", text: "すぐ売って確定損失を防ぐ。これ以上は無理", type: "loss_high" }, { label: "B", text: "回復を信じてホールドし続ける", type: "confirmation" }, { label: "C", text: "周りの投資家仲間がどうするか確認してから決める", type: "social" }, { label: "D", text: "損切りして、次の機会に全力投球する", type: "present_low" }] },
    { id: "B3", phase: "bias", theme: "社会的証明", question: "転職を検討しています。条件は今より良いが、会社の知名度は低い。どう判断する？", options: [{ label: "A", text: "家族や友人の反応を見て最終決断する", type: "social" }, { label: "B", text: "自分の直感と成長できるかどうかだけで判断する", type: "present_low" }, { label: "C", text: "その会社のことを徹底リサーチし、自分の目で判断する", type: "confirmation" }, { label: "D", text: "今の安定した職場を手放すリスクが怖くて踏み出せない", type: "loss_high" }] },
    { id: "B4", phase: "bias", theme: "確証バイアス", question: "自分が「この人は信頼できる」と感じた相手。後日、懸念される情報が出てきた。どうする？", options: [{ label: "A", text: "その情報は例外だと解釈して、引き続き信頼する", type: "confirmation" }, { label: "B", text: "周りの人の評価も聞いてみて、総合的に判断する", type: "social" }, { label: "C", text: "もう距離を置く。感覚が変わってしまった", type: "present_low" }, { label: "D", text: "関係を壊すリスクを考え、様子を見続ける", type: "loss_high" }] },
    { id: "B5", phase: "bias", theme: "現在バイアス・貯蓄", question: "毎月3万円を老後のために積み立てようと決めました。でも今月は欲しいものがある。どうする？", options: [{ label: "A", text: "今月だけ特別に使う。来月から再開すればいい", type: "present_low" }, { label: "B", text: "絶対に積み立てる。将来の自分への約束だから", type: "loss_high" }, { label: "C", text: "SNSで節約している人の投稿を見て、気持ちを引き締める", type: "social" }, { label: "D", text: "本当に必要かどうか、徹底的に自問してから決める", type: "confirmation" }] },
    { id: "B6", phase: "bias", theme: "群衆心理", question: "SNSで「この商品が最高」と大量の口コミが流れてきた。実際に購入しますか？", options: [{ label: "A", text: "みんなが言うなら間違いない。すぐ購入", type: "social" }, { label: "B", text: "口コミより自分の目で成分や仕様を確認してから決める", type: "confirmation" }, { label: "C", text: "今すぐ必要じゃないけど、なくなる前に確保する", type: "loss_high" }, { label: "D", text: "気になったらとりあえず買う。返品すればいい", type: "present_low" }] },
    { id: "B7", phase: "bias", theme: "変化への抵抗", question: "長年使っているツールより明らかに優れた新ツールが登場した。あなたは？", options: [{ label: "A", text: "すぐ乗り換える。より良いものがあれば迷わない", type: "present_low" }, { label: "B", text: "周りの人が使い始めてから検討する", type: "social" }, { label: "C", text: "慣れたものを変えるコストが大きい。今のままでいい", type: "loss_high" }, { label: "D", text: "新ツールのレビューや比較記事を十分読んでから判断", type: "confirmation" }] },
    { id: "B8", phase: "bias", theme: "リスク認知", question: "今の人生に大きな不満はないが、もっと充実できるはず。あなたは次の一手をどう打つ？", options: [{ label: "A", text: "「まあいいか」で現状維持。失うものの方が怖い", type: "loss_high" }, { label: "B", text: "成功している人の行動パターンを研究して、真似る", type: "social" }, { label: "C", text: "直感が動いたら即行動。考えすぎると動けなくなる", type: "present_low" }, { label: "D", text: "自己分析を徹底し、「何が足りないか」を明確にしてから動く", type: "confirmation" }] },
    { id: "B9", phase: "bias", theme: "現状維持バイアス", question: "職場のルールが変わることになりました。今のやり方でも特に問題はありません。あなたは？", options: [{ label: "A", text: "今のやり方で慣れているし、特に困っていない。変える必要を感じない", type: "status_quo" }, { label: "B", text: "新しいルールを自分で確認して、良ければ積極的に取り入れる", type: "present_low" }, { label: "C", text: "周りの人がどう反応するか見てから、自分のスタンスを決める", type: "social" }, { label: "D", text: "変化でうまくいかなくなるリスクの方が、改善より怖く感じる", type: "loss_high" }] },
    { id: "B10", phase: "bias", theme: "現状維持バイアス", question: "毎日使っている通勤ルートより5分早く着く新ルートを見つけました。あなたは？", options: [{ label: "A", text: "今のルートで何年も問題なく来た。わざわざ変える気にならない", type: "status_quo" }, { label: "B", text: "すぐ新ルートに切り替える。5分でも積み重ねれば大きい", type: "present_low" }, { label: "C", text: "友人や同僚も使っているか確認してから切り替えるか決める", type: "social" }, { label: "D", text: "新ルートが本当に安全かどうか、一度下調べしてから決める", type: "confirmation" }] },
    { id: "B11", phase: "bias", theme: "過信バイアス", question: "大きなプロジェクトのリーダーに突然抜擢されました。あなたは？", options: [{ label: "A", text: "自分の実力なら絶対うまくいく。自信を持って引き受ける", type: "overconfidence" }, { label: "B", text: "失敗したときのリスクが頭をよぎり、引き受けるか迷う", type: "loss_high" }, { label: "C", text: "同じ経験をした先輩に話を聞いてから決める", type: "social" }, { label: "D", text: "過去のプロジェクトで積み上げた経験があるから大丈夫、と感じる", type: "sunk_cost" }] },
    { id: "B12", phase: "bias", theme: "過信バイアス", question: "資格試験まであと1ヶ月です。勉強の進み具合は半分ほど。あなたは？", options: [{ label: "A", text: "自分の頭なら残り1ヶ月で十分追いつける。心配していない", type: "overconfidence" }, { label: "B", text: "ここまで勉強してきたのだから、諦めるという選択肢はない", type: "sunk_cost" }, { label: "C", text: "合格した人がどんなペースで勉強したか調べて参考にする", type: "social" }, { label: "D", text: "不合格になるリスクを考えると、今から延期も頭をよぎる", type: "loss_high" }] },
    { id: "B13", phase: "bias", theme: "サンクコストバイアス", question: "1年契約したジムにここ3ヶ月ほとんど行っていません。契約更新の時期が来ました。あなたは？", options: [{ label: "A", text: "1年間お金を払い続けたのだから、更新してもう少し頑張りたい", type: "sunk_cost" }, { label: "B", text: "解約して別のことにお金を使う。行かない事実を直視する", type: "present_low" }, { label: "C", text: "周りでジムを続けている人が多ければ更新、やめた人が多ければ解約", type: "social" }, { label: "D", text: "解約すると健康管理の手段を失うのが怖くて、踏み切れない", type: "loss_high" }] },
    { id: "B14", phase: "bias", theme: "サンクコストバイアス", question: "半年取り組んだ副業が、思ったより全然儲かりません。あなたは？", options: [{ label: "A", text: "ここまで時間と労力をかけたのだから、今さらやめられない", type: "sunk_cost" }, { label: "B", text: "うまくいっている人のやり方を調べて、同じように試してみる", type: "social" }, { label: "C", text: "自分のやり方は間違っていない。もう少し続ければ必ず結果が出る", type: "overconfidence" }, { label: "D", text: "損切りして、別の副業や使い道に切り替える", type: "present_low" }] },
    { id: "B15", phase: "bias", theme: "アンカリングバイアス", question: "スマホを買い替えます。店員から「一番人気は8万円台です」と言われました。あなたは？", options: [{ label: "A", text: "「8万円」と聞いた瞬間、それが普通の価格帯だと感じてしまう", type: "anchoring" }, { label: "B", text: "自分で相場を調べているから、店員の言葉に左右されない", type: "overconfidence" }, { label: "C", text: "口コミで評判の高いモデルを選ぶ。みんなが選ぶものは間違いない", type: "social" }, { label: "D", text: "高いものを買って後悔するリスクが怖く、安い方に引っ張られる", type: "loss_high" }] },
    { id: "B16", phase: "bias", theme: "アンカリングバイアス", question: "給料交渉の場で、人事から「まず希望額を聞かせて」と言われました。あなたは？", options: [{ label: "A", text: "最初に高めの数字を言った方が交渉に有利だと知っている", type: "anchoring" }, { label: "B", text: "同僚や転職サイトの情報をもとに、相場通りの数字を伝える", type: "social" }, { label: "C", text: "自分の市場価値は十分わかっている。自信を持って希望を伝える", type: "overconfidence" }, { label: "D", text: "今もらっている額を基準に、少し上乗せした額を伝える", type: "status_quo" }] },
  ],
};

export const JUNG_TYPE_MAP = {
  Te: { name: "外向的思考", light: "指揮者", shadow: "鉄砲玉" },
  Ti: { name: "内向的思考", light: "職人", shadow: "堂々巡り" },
  Fe: { name: "外向的感情", light: "聴き手", shadow: "八方美人" },
  Fi: { name: "内向的感情", light: "求道者", shadow: "頑固者" },
  Se: { name: "外向的感覚", light: "今を楽しむ人", shadow: "思いつき人" },
  Si: { name: "内向的感覚", light: "コツコツ人", shadow: "現状維持人" },
  Ne: { name: "外向的直観", light: "発明家", shadow: "三日坊主" },
  Ni: { name: "内向的直観", light: "先読み人", shadow: "独走者" },
};

export const BIAS_MAP = {
  present_high: { name: "強い現在バイアス", desc: "今この瞬間の報酬を強く重視する" },
  present_low: { name: "行動重視型", desc: "分析より即行動。スピードで勝負する" },
  loss_high: { name: "損失回避バイアス", desc: "損を極端に恐れる" },
  loss_low: { name: "長期思考型", desc: "未来の安定のために現在を制御できる" },
  social: { name: "同調バイアス", desc: "周りに合わせてしまう" },
  confirmation: { name: "確証バイアス", desc: "自分の信念に合う情報だけ集める" },
  status_quo: { name: "現状維持バイアス", desc: "変化を避け現状にとどまろうとする" },
  overconfidence: { name: "過信バイアス", desc: "自分の判断・能力を過大評価する" },
  sunk_cost: { name: "サンクコストバイアス", desc: "過去の投資・労力に引きずられる" },
  anchoring: { name: "アンカリングバイアス", desc: "最初に得た情報に判断が引きずられる" },
};

export const OCCUPATIONS_18 = [
  { id: "会社員", label: "会社員" },
  { id: "公務員", label: "公務員" },
  { id: "医療職", label: "医療職" },
  { id: "教育職", label: "教育職" },
  { id: "士業", label: "士業" },
  { id: "クリエイター", label: "クリエイター" },
  { id: "接客", label: "接客" },
  { id: "調理", label: "調理" },
  { id: "理美容師", label: "理美容師" },
  { id: "介護", label: "介護" },
  { id: "フリーランス", label: "フリーランス" },
  { id: "自営業", label: "自営業" },
  { id: "一次産業", label: "一次産業" },
  { id: "建設業", label: "建設業" },
  { id: "主婦/主夫", label: "主婦/主夫" },
  { id: "非正規雇用", label: "非正規雇用" },
  { id: "学生", label: "学生" },
  { id: "無職", label: "無職" },
];

export const GENERATIONS_7 = [
  { id: "10s", label: "10代" },
  { id: "20s", label: "20代" },
  { id: "30s", label: "30代" },
  { id: "40s", label: "40代" },
  { id: "50s", label: "50代" },
  { id: "60s", label: "60代" },
  { id: "70s", label: "70代以上" },
];

export function calcResults(answers) {
  const jungCount = {};
  const biasCount = {};

  Object.entries(answers).forEach(([qid, type]) => {
    if (qid.startsWith("J")) jungCount[type] = (jungCount[type] || 0) + 1;
    else biasCount[type] = (biasCount[type] || 0) + 1;
  });

  const topJung = Object.entries(jungCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "Ni";
  const sortedBias = Object.entries(biasCount).sort((a, b) => b[1] - a[1]);
  const topBias = sortedBias[0]?.[0] || "social";
  const topBias2 = sortedBias[1]?.[0];
  const jungBase = topJung.replace(/[EI]/, "");
  const jungInfo = JUNG_TYPE_MAP[jungBase] || JUNG_TYPE_MAP[topJung];
  const totalJung = Object.values(jungCount).reduce((a, b) => a + b, 0);
  const dominance = jungCount[topJung] / totalJung;
  const isLight = dominance >= 0.35;

  return {
    topJung: jungBase,
    jungInfo,
    topBias,
    biasInfo: BIAS_MAP[topBias],
    topBias2: topBias2 || null,
    biasInfo2: topBias2 ? BIAS_MAP[topBias2] : null,
    isLight,
  };
}
