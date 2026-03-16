import { useState } from "react";

const QUESTIONS = {
  jung: [
    {
      id: "J1",
      phase: "jung",
      theme: "意思決定",
      question: "仕事や生活で重要な決断を迫られたとき、あなたが一番頼りにするのは？",
      options: [
        { label: "A", text: "データや実績に基づいた論理的な分析", type: "Te" },
        { label: "B", text: "その場でひらめく「なんとなく正しい」という感覚", type: "Ni" },
        { label: "C", text: "周りの人への影響や、関係が壊れないかどうか", type: "Fe" },
        { label: "D", text: "これまでの経験や、実際に試してみた結果", type: "Si" },
      ],
    },
    {
      id: "J2",
      phase: "jung",
      theme: "エネルギーの回復",
      question: "疲れてへとへとのとき、あなたが自然と求めるのは？",
      options: [
        { label: "A", text: "一人で静かに過ごし、読書や内省で回復する", type: "Ni" },
        { label: "B", text: "友人や家族と話して、賑やかな空気に包まれる", type: "Fe" },
        { label: "C", text: "好きなことに没頭して、五感を研ぎ澄ます", type: "Se" },
        { label: "D", text: "新しいアイデアを妄想したり、可能性を膨らませる", type: "Ne" },
      ],
    },
    {
      id: "J3",
      phase: "jung",
      theme: "他者への関わり方",
      question: "チームや友人同士で意見が食い違ったとき、あなたはどうする？",
      options: [
        { label: "A", text: "論理的にもっとも筋の通る結論を出して、みんなに提示する", type: "Te" },
        { label: "B", text: "みんなが納得できる着地点を、話し合いながら探る", type: "Fe" },
        { label: "C", text: "自分が正しいと思うことを、譲らずに伝える", type: "Fi" },
        { label: "D", text: "「とりあえずやってみよう」と、まず動いてみせる", type: "Se" },
      ],
    },
    {
      id: "J4",
      phase: "jung",
      theme: "時間軸の感覚",
      question: "「未来」についてどう感じることが多いですか？",
      options: [
        { label: "A", text: "鮮明なビジョンがあり、そこへ向かう確信がある", type: "Ni" },
        { label: "B", text: "いろんな可能性が広がって見えて、ワクワクする", type: "Ne" },
        { label: "C", text: "今の積み重ねが未来をつくると感じ、着実に備える", type: "Si" },
        { label: "D", text: "今この瞬間が大事で、未来はあまり考えない", type: "Se" },
      ],
    },
    {
      id: "J5",
      phase: "jung",
      theme: "学びのスタイル",
      question: "新しいスキルや知識を身につけるとき、あなたに合うのは？",
      options: [
        { label: "A", text: "仕組みや理論をしっかり理解してから、手を動かす", type: "Ti" },
        { label: "B", text: "まずやってみて、体で覚えていく", type: "Se" },
        { label: "C", text: "全体像や「なぜこれが大切か」を掴んでから始める", type: "Ni" },
        { label: "D", text: "いろんな角度から調べて、関連づけながら理解する", type: "Ne" },
      ],
    },
    {
      id: "J6",
      phase: "jung",
      theme: "葛藤への反応",
      question: "誰かと意見がぶつかったとき、あなたはまず何をしたくなる？",
      options: [
        { label: "A", text: "相手の論理の穴を整理して、筋の通る説明を求める", type: "Ti" },
        { label: "B", text: "相手がなぜそう思うのか、気持ちを理解しようとする", type: "Fe" },
        { label: "C", text: "自分の信念が揺らいでいないか、内側で確認する", type: "Fi" },
        { label: "D", text: "早く結論を出して、次のステップに進みたいと思う", type: "Te" },
      ],
    },
    {
      id: "J7",
      phase: "jung",
      theme: "創造性の源泉",
      question: "「いいアイデアが浮かぶ」のはどんなとき？",
      options: [
        { label: "A", text: "シャワーや散歩など、ぼんやりしているとき突然来る", type: "Ni" },
        { label: "B", text: "人と話しているうちに、どんどん発展していく", type: "Ne" },
        { label: "C", text: "問題をじっくり分析していると、解が見えてくる", type: "Ti" },
        { label: "D", text: "実際に手を動かしながら、試行錯誤の中で生まれる", type: "Se" },
      ],
    },
    {
      id: "J8",
      phase: "jung",
      theme: "リーダーシップ",
      question: "チームを動かすとき、あなたが自然とやるのは？",
      options: [
        { label: "A", text: "明確な計画と役割を決め、効率よく進める", type: "Te" },
        { label: "B", text: "一人ひとりの気持ちに寄り添い、やる気を引き出す", type: "Fe" },
        { label: "C", text: "「こうあるべき」というビジョンを掲げて引っ張る", type: "Ni" },
        { label: "D", text: "自分が率先して動き、背中で示す", type: "Se" },
      ],
    },
    {
      id: "J9",
      phase: "jung",
      theme: "記憶と過去",
      question: "これまでの経験や思い出について、あなたに当てはまるのは？",
      options: [
        { label: "A", text: "大事な記憶を大切に持ち、今の判断にも活かしている", type: "Si" },
        { label: "B", text: "過去より「これから先どうなるか」に意識が向きがち", type: "Ne" },
        { label: "C", text: "昔の感情体験が、今の自分の価値観の土台になっている", type: "Fi" },
        { label: "D", text: "過去を分析して、パターンや法則を見つけて活用する", type: "Ti" },
      ],
    },
    {
      id: "J10",
      phase: "jung",
      theme: "感情の扱い方",
      question: "自分の感情について、最も当てはまるのは？",
      options: [
        { label: "A", text: "感情は内側で深く感じるが、外には見せないことが多い", type: "Fi" },
        { label: "B", text: "感情は表情や言葉で自然と外に出る", type: "Fe" },
        { label: "C", text: "感情より先に「論理的に何が正しいか」を考える", type: "Ti" },
        { label: "D", text: "感情は今この瞬間の反応として素直に表れる", type: "Se" },
      ],
    },
    {
      id: "J11",
      phase: "jung",
      theme: "完璧主義とスピード",
      question: "仕事やプロジェクトの進め方で自分に近いのは？",
      options: [
        { label: "A", text: "完璧に仕上げてから公開・提出したい", type: "Ti" },
        { label: "B", text: "まず出してみて、フィードバックで改善する", type: "Se" },
        { label: "C", text: "全体のビジョンが固まらないと動けない", type: "Ni" },
        { label: "D", text: "みんなが納得した状態で進めたい", type: "Fe" },
      ],
    },
    {
      id: "J12",
      phase: "jung",
      theme: "孤独と社会性",
      question: "「一人の時間」と「人といる時間」、どちらがあなたらしい？",
      options: [
        { label: "A", text: "一人の時間こそ充実する。自分の内側と向き合える", type: "Fi" },
        { label: "B", text: "人といるとエネルギーが湧く。会話でアイデアが広がる", type: "Fe" },
        { label: "C", text: "一人でいながら、先のことや可能性を想像するのが好き", type: "Ni" },
        { label: "D", text: "どちらも必要。メリハリをつけて切り替えている", type: "Si" },
      ],
    },
    {
      id: "J13",
      phase: "jung",
      theme: "変化への適応",
      question: "予期しない変化が起きたとき、あなたの第一反応は？",
      options: [
        { label: "A", text: "まず全体状況を論理的に整理し、対策を立てる", type: "Te" },
        { label: "B", text: "この変化が何を意味するのか、深く考え込む", type: "Ni" },
        { label: "C", text: "とにかく動きながら状況を掴んでいく", type: "Se" },
        { label: "D", text: "周りの人の様子を確認しながら、一緒に乗り越える", type: "Fe" },
      ],
    },
    {
      id: "J14",
      phase: "jung",
      theme: "批判への反応",
      question: "自分の仕事や考えを批判されたとき、どう感じる？",
      options: [
        { label: "A", text: "批判の論理的根拠を確認し、正しければ改善する", type: "Ti" },
        { label: "B", text: "自分の価値観や信念が否定された気がして傷つく", type: "Fi" },
        { label: "C", text: "相手がなぜそう思うのかを理解しようとする", type: "Fe" },
        { label: "D", text: "悔しいが、結果で証明しようとすぐ動く", type: "Se" },
      ],
    },
    {
      id: "J15",
      phase: "jung",
      theme: "使命感",
      question: "あなたが最も「生きている」と感じる瞬間は？",
      options: [
        { label: "A", text: "困難な問題を解き明かし、真実に到達したとき", type: "Ti" },
        { label: "B", text: "誰かの人生にとってプラスになることができたとき", type: "Fe" },
        { label: "C", text: "自分のビジョンが現実になっていくのを見るとき", type: "Ni" },
        { label: "D", text: "今この瞬間に全力を注ぎ、完全に没入しているとき", type: "Se" },
      ],
    },
  ],
  bias: [
    {
      id: "B1",
      phase: "bias",
      theme: "時間割引",
      question: "副業で月5万円を稼ぐチャンスが来ました。ただし最初の3ヶ月は収支がマイナスになるかもしれません。あなたは？",
      options: [
        { label: "A", text: "すぐに始める。やらない後悔より、やる後悔", type: "present_low" },
        { label: "B", text: "3ヶ月後の収支シミュレーションを徹底的に調べてから決める", type: "confirmation" },
        { label: "C", text: "同じことをした知人の話を聞いてから判断する", type: "social" },
        { label: "D", text: "今の収入が安定しているうちは動かない", type: "loss_high" },
      ],
    },
    {
      id: "B2",
      phase: "bias",
      theme: "損失回避",
      question: "投資した株が-20%になっています。専門家は「回復の見込みあり」と言っています。あなたは？",
      options: [
        { label: "A", text: "すぐ売って確定損失を防ぐ。これ以上は無理", type: "loss_high" },
        { label: "B", text: "回復を信じてホールドし続ける", type: "confirmation" },
        { label: "C", text: "周りの投資家仲間がどうするか確認してから決める", type: "social" },
        { label: "D", text: "損切りして、次の機会に全力投球する", type: "present_low" },
      ],
    },
    {
      id: "B3",
      phase: "bias",
      theme: "社会的証明",
      question: "転職を検討しています。条件は今より良いが、会社の知名度は低い。どう判断する？",
      options: [
        { label: "A", text: "家族や友人の反応を見て最終決断する", type: "social" },
        { label: "B", text: "自分の直感と成長できるかどうかだけで判断する", type: "present_low" },
        { label: "C", text: "その会社のことを徹底リサーチし、自分の目で判断する", type: "confirmation" },
        { label: "D", text: "今の安定した職場を手放すリスクが怖くて踏み出せない", type: "loss_high" },
      ],
    },
    {
      id: "B4",
      phase: "bias",
      theme: "確証バイアス",
      question: "自分が「この人は信頼できる」と感じた相手。後日、懸念される情報が出てきた。どうする？",
      options: [
        { label: "A", text: "その情報は例外だと解釈して、引き続き信頼する", type: "confirmation" },
        { label: "B", text: "周りの人の評価も聞いてみて、総合的に判断する", type: "social" },
        { label: "C", text: "もう距離を置く。感覚が変わってしまった", type: "present_low" },
        { label: "D", text: "関係を壊すリスクを考え、様子を見続ける", type: "loss_high" },
      ],
    },
    {
      id: "B5",
      phase: "bias",
      theme: "現在バイアス・貯蓄",
      question: "毎月3万円を老後のために積み立てようと決めました。でも今月は欲しいものがある。どうする？",
      options: [
        { label: "A", text: "今月だけ特別に使う。来月から再開すればいい", type: "present_high" },
        { label: "B", text: "絶対に積み立てる。将来の自分への約束だから", type: "loss_low" },
        { label: "C", text: "SNSで節約している人の投稿を見て、気持ちを引き締める", type: "social" },
        { label: "D", text: "本当に必要かどうか、徹底的に自問してから決める", type: "confirmation" },
      ],
    },
    {
      id: "B6",
      phase: "bias",
      theme: "群衆心理",
      question: "SNSで「この商品が最高」と大量の口コミが流れてきた。実際に購入しますか？",
      options: [
        { label: "A", text: "みんなが言うなら間違いない。すぐ購入", type: "social" },
        { label: "B", text: "口コミより自分の目で成分や仕様を確認してから決める", type: "confirmation" },
        { label: "C", text: "今すぐ必要じゃないけど、なくなる前に確保する", type: "loss_high" },
        { label: "D", text: "気になったらとりあえず買う。返品すればいい", type: "present_low" },
      ],
    },
    {
      id: "B7",
      phase: "bias",
      theme: "変化への抵抗",
      question: "長年使っているツールより明らかに優れた新ツールが登場した。あなたは？",
      options: [
        { label: "A", text: "すぐ乗り換える。より良いものがあれば迷わない", type: "present_low" },
        { label: "B", text: "周りの人が使い始めてから検討する", type: "social" },
        { label: "C", text: "慣れたものを変えるコストが大きい。今のままでいい", type: "loss_high" },
        { label: "D", text: "新ツールのレビューや比較記事を十分読んでから判断", type: "confirmation" },
      ],
    },
    {
      id: "B8",
      phase: "bias",
      theme: "リスク認知",
      question: "今の人生に大きな不満はないが、もっと充実できるはず。あなたは次の一手をどう打つ？",
      options: [
        { label: "A", text: "「まあいいか」で現状維持。失うものの方が怖い", type: "loss_high" },
        { label: "B", text: "成功している人の行動パターンを研究して、真似る", type: "social" },
        { label: "C", text: "直感が動いたら即行動。考えすぎると動けなくなる", type: "present_low" },
        { label: "D", text: "自己分析を徹底し、「何が足りないか」を明確にしてから動く", type: "confirmation" },
      ],
    },
    {
      id: "B9",
      phase: "bias",
      theme: "現状維持バイアス",
      question: "職場のルール変更の話が出ました。今のやり方でも特に問題はないように思います。あなたは？",
      options: [
        { label: "A", text: "変える必要がない。慣れたやり方の方が安心", type: "status_quo" },
        { label: "B", text: "自分の感覚では今のままで正しい。変えるべき理由がない", type: "overconfidence" },
        { label: "C", text: "これまで築いてきた仕組みを無駄にするのはもったいない", type: "sunk_cost" },
        { label: "D", text: "最初に聞いた「問題ない」という意見が頭から離れない", type: "anchoring" },
      ],
    },
    {
      id: "B10",
      phase: "bias",
      theme: "現状維持バイアス",
      question: "定番の通勤ルートがある。新しいルートの方が5分短縮できそうですが？",
      options: [
        { label: "A", text: "今のルートで慣れている。変えるのは面倒", type: "status_quo" },
        { label: "B", text: "今のルートの方が確実。自分の判断を信じる", type: "overconfidence" },
        { label: "C", text: "これまで何年もこのルートで来てきた。変える理由がない", type: "sunk_cost" },
        { label: "D", text: "最初に覚えたルートが「正解」として刷り込まれている", type: "anchoring" },
      ],
    },
    {
      id: "B11",
      phase: "bias",
      theme: "過信バイアス",
      question: "大きなプロジェクトのリーダーに抜擢されました。うまくいくと思いますか？",
      options: [
        { label: "A", text: "今まで通りでいい。自分は変えなくてよい", type: "status_quo" },
        { label: "B", text: "自分の実力なら大丈夫。必ず成功できる", type: "overconfidence" },
        { label: "C", text: "ここまで来たのだから、もう引き返せない", type: "sunk_cost" },
        { label: "D", text: "「抜擢された」という事実が、自分はできると錯覚させる", type: "anchoring" },
      ],
    },
    {
      id: "B12",
      phase: "bias",
      theme: "過信バイアス",
      question: "新しい資格の勉強を始めました。試験まであと1ヶ月。あなたは？",
      options: [
        { label: "A", text: "いつも通りのペースで。変に焦らなくていい", type: "status_quo" },
        { label: "B", text: "自分の理解力なら、この期間で十分間に合う", type: "overconfidence" },
        { label: "C", text: "ここまで勉強したのだから、合格までやり切る", type: "sunk_cost" },
        { label: "D", text: "「1ヶ月あれば大丈夫」と誰かに言われた気がする", type: "anchoring" },
      ],
    },
    {
      id: "B13",
      phase: "bias",
      theme: "サンクコストバイアス",
      question: "1年通い続けたジム。最近はほとんど行っていません。今後どうする？",
      options: [
        { label: "A", text: "今のまま契約を続ける。解約手続きが面倒", type: "status_quo" },
        { label: "B", text: "自分はまた通い始める。意志の強さには自信がある", type: "overconfidence" },
        { label: "C", text: "1年分払ったのだから、もう少し続けてみる", type: "sunk_cost" },
        { label: "D", text: "最初に「続けると決めた」自分を変えられない", type: "anchoring" },
      ],
    },
    {
      id: "B14",
      phase: "bias",
      theme: "サンクコストバイアス",
      question: "趣味で始めた副業が、思ったより儲かりません。あなたは？",
      options: [
        { label: "A", text: "今まで通り続けて様子を見る。変化は怖い", type: "status_quo" },
        { label: "B", text: "自分のやり方ならそのうち芽が出る。信じて続ける", type: "overconfidence" },
        { label: "C", text: "ここまで時間とお金をかけたのだから、諦められない", type: "sunk_cost" },
        { label: "D", text: "最初に「これでいける」と思った直感を変えられない", type: "anchoring" },
      ],
    },
    {
      id: "B15",
      phase: "bias",
      theme: "アンカリングバイアス",
      question: "スマホを買い換えます。店員が「人気モデルは8万円台です」と最初に言いました。あなたは？",
      options: [
        { label: "A", text: "今使っているのと似た価格帯で探す", type: "status_quo" },
        { label: "B", text: "自分で調べた結果、適正価格は分かっている", type: "overconfidence" },
        { label: "C", text: "今の端末に使ったお金を考えると、高くてもいい", type: "sunk_cost" },
        { label: "D", text: "「8万円」という数字が頭にあって、それ基準で考えてしまう", type: "anchoring" },
      ],
    },
    {
      id: "B16",
      phase: "bias",
      theme: "アンカリングバイアス",
      question: "給料交渉をします。人事から「まず希望を聞かせて」と言われました。あなたは？",
      options: [
        { label: "A", text: "今の給与が基準。あまり変えたくない", type: "status_quo" },
        { label: "B", text: "自分の市場価値は分かっている。自信を持って伝える", type: "overconfidence" },
        { label: "C", text: "今まで頑張ってきたのだから、それに見合う額を", type: "sunk_cost" },
        { label: "D", text: "最初に思い浮かんだ数字が、そのまま基準になってしまう", type: "anchoring" },
      ],
    },
  ],
};

const JUNG_TYPE_MAP = {
  Te: { name: "外向的思考", light: "指揮者", shadow: "鉄砲玉" },
  Ti: { name: "内向的思考", light: "職人", shadow: "堂々巡り" },
  Fe: { name: "外向的感情", light: "聴き手", shadow: "八方美人" },
  Fi: { name: "内向的感情", light: "求道者", shadow: "頑固者" },
  Se: { name: "外向的感覚", light: "今を楽しむ人", shadow: "思いつき人" },
  Si: { name: "内向的感覚", light: "コツコツ人", shadow: "現状維持人" },
  Ne: { name: "外向的直観", light: "発明家", shadow: "三日坊主" },
  Ni: { name: "内向的直観", light: "先読み人", shadow: "独走者" },
};

const BIAS_MAP = {
  present_high: { name: "強い現在バイアス", desc: "今この瞬間の報酬を強く重視する" },
  present_low: { name: "行動重視型", desc: "分析より即行動。スピードで勝負する" },
  loss_high: { name: "強い損失回避", desc: "失うことへの恐れが意思決定を支配する" },
  loss_low: { name: "長期思考型", desc: "未来の安定のために現在を制御できる" },
  social: { name: "社会的証明依存", desc: "他者の行動・評価が判断の基準になる" },
  confirmation: { name: "確証バイアス", desc: "自分の信念を強化する情報を優先する" },
  status_quo: { name: "現状維持バイアス", desc: "変化を避け、慣れた現状にとどまろうとする" },
  overconfidence: { name: "過信バイアス", desc: "自分の判断・能力を過大評価しがち" },
  sunk_cost: { name: "サンクコストバイアス", desc: "過去の投資・労力に引きずられ続けてしまう" },
  anchoring: { name: "アンカリングバイアス", desc: "最初に得た情報が判断の基準になってしまう" },
};

function calcResults(answers) {
  const jungCount = {};
  const biasCount = {};

  Object.entries(answers).forEach(([qid, type]) => {
    if (qid.startsWith("J")) {
      jungCount[type] = (jungCount[type] || 0) + 1;
    } else {
      biasCount[type] = (biasCount[type] || 0) + 1;
    }
  });

  const topJung = Object.entries(jungCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "Ni";
  const topBias = Object.entries(biasCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "social";
  const jungBase = topJung.replace(/[EI]/, "");
  const jungInfo = JUNG_TYPE_MAP[jungBase] || JUNG_TYPE_MAP[topJung];
  const totalJung = Object.values(jungCount).reduce((a, b) => a + b, 0);
  const dominance = jungCount[topJung] / totalJung;
  const isLight = dominance >= 0.35;

  return { topJung: jungBase, jungInfo, topBias, biasInfo: BIAS_MAP[topBias], isLight };
}

export default function LifeOracleQuestions() {
  const [phase, setPhase] = useState("intro"); // intro | occupation | generation | jung | bias | result
  const [occupation, setOccupation] = useState(null);
  const [generation, setGeneration] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [jungDone, setJungDone] = useState(false);
  const [selected, setSelected] = useState(null);
  const [animating, setAnimating] = useState(false);

  const occupations = [
    { id: "org", label: "会社員 / 公務員 / 教育者", icon: "🏢" },
    { id: "indie", label: "自営業 / フリーランス / 起業家", icon: "🚀" },
    { id: "invest", label: "投資家 / 資産運用", icon: "📈" },
    { id: "craft", label: "職人 / 芸術家 / クリエイター", icon: "🎨" },
    { id: "support", label: "アルバイト / 主婦・主夫 / 派遣", icon: "🌿" },
    { id: "influence", label: "経営者 / 政治家 / インフルエンサー", icon: "⚡" },
  ];

  const generations = [
    { id: "10s", label: "10代", sub: "13〜19歳" },
    { id: "20s", label: "20代", sub: "20〜29歳" },
    { id: "30s", label: "30代", sub: "30〜39歳" },
    { id: "40s", label: "40代", sub: "40〜49歳" },
    { id: "50s", label: "50代", sub: "50〜59歳" },
    { id: "60s", label: "60代", sub: "60〜69歳" },
    { id: "70s", label: "70代", sub: "70〜79歳" },
  ];

  const currentPhaseQuestions = jungDone ? QUESTIONS.bias : QUESTIONS.jung;
  const currentQuestion = currentPhaseQuestions[currentQ];
  const totalQ = QUESTIONS.jung.length + QUESTIONS.bias.length;
  const answeredQ = Object.keys(answers).length;
  const progress = (answeredQ / totalQ) * 100;

  function handleAnswer(type) {
    if (animating) return;
    setSelected(type);
    setAnimating(true);
    setTimeout(() => {
      const newAnswers = { ...answers, [currentQuestion.id]: type };
      setAnswers(newAnswers);
      setSelected(null);
      setAnimating(false);

      if (!jungDone) {
        if (currentQ + 1 < QUESTIONS.jung.length) {
          setCurrentQ(currentQ + 1);
        } else {
          setJungDone(true);
          setCurrentQ(0);
          setPhase("bias_intro");
        }
      } else {
        if (currentQ + 1 < QUESTIONS.bias.length) {
          setCurrentQ(currentQ + 1);
        } else {
          setPhase("result");
        }
      }
    }, 400);
  }

  const results = phase === "result" ? calcResults(answers) : null;

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Noto+Serif+JP:wght@300;400;600&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0a0a14; }
    .oracle-wrap {
      min-height: 100vh;
      background: radial-gradient(ellipse at 20% 50%, #1a0a2e 0%, #0a0a14 50%, #0d1a0a 100%);
      color: #e8e0d0;
      font-family: 'Noto Serif JP', serif;
      display: flex; flex-direction: column; align-items: center;
      padding: 20px;
    }
    .stars {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none; z-index: 0;
      background-image:
        radial-gradient(1px 1px at 10% 15%, rgba(255,255,255,0.6) 0%, transparent 100%),
        radial-gradient(1px 1px at 30% 40%, rgba(255,255,255,0.4) 0%, transparent 100%),
        radial-gradient(1px 1px at 60% 10%, rgba(255,255,255,0.5) 0%, transparent 100%),
        radial-gradient(1px 1px at 80% 70%, rgba(255,255,255,0.3) 0%, transparent 100%),
        radial-gradient(1px 1px at 45% 80%, rgba(255,255,255,0.4) 0%, transparent 100%),
        radial-gradient(1px 1px at 90% 30%, rgba(255,255,255,0.5) 0%, transparent 100%),
        radial-gradient(1px 1px at 25% 65%, rgba(255,255,255,0.3) 0%, transparent 100%),
        radial-gradient(1px 1px at 70% 50%, rgba(255,255,255,0.4) 0%, transparent 100%);
    }
    .content { position: relative; z-index: 1; width: 100%; max-width: 700px; }
    .logo {
      text-align: center; padding: 40px 0 20px;
      font-family: 'Cinzel', serif;
      font-size: 13px; letter-spacing: 6px; color: #c4940a;
      text-transform: uppercase;
    }
    .orb {
      width: 80px; height: 80px; margin: 0 auto 24px;
      border-radius: 50%;
      background: radial-gradient(circle at 35% 35%, #b8d4ff, #6b21a8 40%, #1a0a2e 80%);
      box-shadow: 0 0 30px rgba(139,92,246,0.4), 0 0 60px rgba(139,92,246,0.15);
      animation: pulse 3s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 30px rgba(139,92,246,0.4), 0 0 60px rgba(139,92,246,0.15); }
      50% { box-shadow: 0 0 50px rgba(139,92,246,0.7), 0 0 100px rgba(139,92,246,0.3); }
    }
    .title-jp { font-size: 28px; font-weight: 600; text-align: center; color: #f0ead8; margin-bottom: 8px; }
    .subtitle { text-align: center; font-size: 13px; color: #8a7a6a; letter-spacing: 2px; margin-bottom: 40px; }
    .card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(196,148,10,0.2);
      border-radius: 16px; padding: 36px;
      backdrop-filter: blur(10px);
      margin-bottom: 20px;
    }
    .phase-label {
      font-family: 'Cinzel', serif;
      font-size: 10px; letter-spacing: 4px; color: #c4940a;
      text-transform: uppercase; margin-bottom: 8px;
    }
    .theme-tag {
      display: inline-block;
      font-size: 11px; color: #6b7a5a;
      border: 1px solid rgba(107,122,90,0.3);
      border-radius: 20px; padding: 3px 12px; margin-bottom: 20px;
    }
    .question-text {
      font-size: 20px; line-height: 1.7; color: #f0ead8;
      margin-bottom: 32px; font-weight: 400;
    }
    .option-btn {
      width: 100%; text-align: left;
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(196,148,10,0.15);
      border-radius: 10px; padding: 16px 20px;
      margin-bottom: 10px; cursor: pointer;
      color: #c8bfa8; font-family: 'Noto Serif JP', serif;
      font-size: 15px; line-height: 1.6;
      transition: all 0.2s ease; display: flex; align-items: flex-start; gap: 12px;
    }
    .option-btn:hover { background: rgba(196,148,10,0.08); border-color: rgba(196,148,10,0.4); color: #f0ead8; }
    .option-btn.selected { background: rgba(139,92,246,0.15); border-color: rgba(139,92,246,0.5); color: #f0ead8; }
    .option-label {
      font-family: 'Cinzel', serif; font-size: 12px; color: #c4940a;
      min-width: 18px; margin-top: 2px;
    }
    .progress-bar {
      height: 2px; background: rgba(255,255,255,0.05); border-radius: 2px;
      margin-bottom: 32px; overflow: hidden;
    }
    .progress-fill {
      height: 100%; background: linear-gradient(90deg, #6b21a8, #c4940a);
      border-radius: 2px; transition: width 0.5s ease;
    }
    .progress-text { font-size: 11px; color: #6a5a4a; text-align: right; margin-top: 6px; margin-bottom: 24px; }
    .select-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .select-card {
      background: rgba(255,255,255,0.02); border: 1px solid rgba(196,148,10,0.15);
      border-radius: 12px; padding: 20px 16px; cursor: pointer;
      transition: all 0.2s; text-align: center;
      font-family: 'Noto Serif JP', serif; color: #c8bfa8; font-size: 14px;
    }
    .select-card:hover { background: rgba(196,148,10,0.08); border-color: rgba(196,148,10,0.4); color: #f0ead8; }
    .select-card.active { background: rgba(139,92,246,0.15); border-color: rgba(139,92,246,0.5); color: #f0ead8; }
    .select-icon { font-size: 28px; margin-bottom: 10px; }
    .gen-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
    .gen-card {
      background: rgba(255,255,255,0.02); border: 1px solid rgba(196,148,10,0.15);
      border-radius: 10px; padding: 16px 8px; cursor: pointer;
      transition: all 0.2s; text-align: center; font-family: 'Noto Serif JP', serif;
    }
    .gen-card:hover { background: rgba(196,148,10,0.08); border-color: rgba(196,148,10,0.4); }
    .gen-card.active { background: rgba(139,92,246,0.15); border-color: rgba(139,92,246,0.5); }
    .gen-num { font-family: 'Cinzel', serif; font-size: 22px; color: #c4940a; }
    .gen-sub { font-size: 10px; color: #6a5a4a; margin-top: 4px; }
    .next-btn {
      width: 100%; padding: 16px;
      background: linear-gradient(135deg, #6b21a8, #c4940a);
      border: none; border-radius: 10px; cursor: pointer;
      font-family: 'Cinzel', serif; font-size: 13px; letter-spacing: 3px;
      color: #f0ead8; text-transform: uppercase; margin-top: 20px;
      opacity: 0.4; transition: opacity 0.2s;
    }
    .next-btn.ready { opacity: 1; }
    .next-btn.ready:hover { opacity: 0.85; }
    .section-title { font-size: 22px; color: #f0ead8; margin-bottom: 12px; text-align: center; }
    .section-desc { font-size: 14px; color: #8a7a6a; line-height: 1.8; text-align: center; margin-bottom: 28px; }
    .intro-btn {
      width: 100%; padding: 18px;
      background: linear-gradient(135deg, #1a0a2e, #2d1b69);
      border: 1px solid rgba(139,92,246,0.4);
      border-radius: 12px; cursor: pointer;
      font-family: 'Cinzel', serif; font-size: 13px; letter-spacing: 3px;
      color: #c8bfa8; text-transform: uppercase;
      transition: all 0.3s;
    }
    .intro-btn:hover { border-color: rgba(196,148,10,0.6); color: #f0ead8; background: linear-gradient(135deg, #2d1b69, #1a0a2e); }
    .result-type {
      font-family: 'Cinzel', serif; font-size: 11px; letter-spacing: 4px;
      color: #c4940a; text-transform: uppercase; text-align: center; margin-bottom: 8px;
    }
    .result-name { font-size: 32px; text-align: center; color: #f0ead8; margin-bottom: 6px; }
    .result-badge {
      display: inline-block;
      padding: 4px 16px; border-radius: 20px; font-size: 12px;
      border: 1px solid; margin: 0 auto 24px; display: block; width: fit-content;
    }
    .badge-light { color: #a8d8a8; border-color: rgba(168,216,168,0.4); background: rgba(168,216,168,0.08); }
    .badge-shadow { color: #d8a8a8; border-color: rgba(216,168,168,0.4); background: rgba(216,168,168,0.08); }
    .result-divider { height: 1px; background: rgba(196,148,10,0.2); margin: 24px 0; }
    .result-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; }
    .result-key { font-size: 12px; color: #6a5a4a; letter-spacing: 1px; }
    .result-val { font-size: 14px; color: #c8bfa8; text-align: right; max-width: 60%; }
    .cta-text { font-size: 13px; color: #6a5a4a; text-align: center; line-height: 1.8; margin-top: 24px; }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="oracle-wrap">
        <div className="stars" />
        <div className="content">
          <div className="logo">Life Oracle</div>

          {/* INTRO */}
          {phase === "intro" && (
            <div className="card" style={{ textAlign: "center" }}>
              <div className="orb" />
              <div className="title-jp">ライフ・オラクル</div>
              <div className="subtitle">AI が紡ぐ、あなただけの人生指南書</div>
              <p style={{ fontSize: 14, color: "#8a7a6a", lineHeight: 1.9, marginBottom: 32 }}>
                ユング心理学の8つの心理機能と<br />
                行動経済学の意思決定パターンから、<br />
                あなただけの人生の羅針盤を生成します。<br /><br />
                所要時間：約10〜12分（全31問）
              </p>
              <button className="intro-btn" onClick={() => setPhase("occupation")}>
                ✦ 診断を始める ✦
              </button>
            </div>
          )}

          {/* OCCUPATION */}
          {phase === "occupation" && (
            <div className="card">
              <div className="phase-label">Step 1 / 4</div>
              <div className="section-title">あなたの職業に近いのは？</div>
              <div className="section-desc">「働き方の構造」で選んでください</div>
              <div className="select-grid">
                {occupations.map(o => (
                  <div
                    key={o.id}
                    className={`select-card ${occupation === o.id ? "active" : ""}`}
                    onClick={() => setOccupation(o.id)}
                  >
                    <div className="select-icon">{o.icon}</div>
                    <div>{o.label}</div>
                  </div>
                ))}
              </div>
              <button
                className={`next-btn ${occupation ? "ready" : ""}`}
                onClick={() => occupation && setPhase("generation")}
              >
                次へ →
              </button>
            </div>
          )}

          {/* GENERATION */}
          {phase === "generation" && (
            <div className="card">
              <div className="phase-label">Step 2 / 4</div>
              <div className="section-title">あなたの世代は？</div>
              <div className="section-desc">人生のフェーズに合わせた指南書を生成します</div>
              <div className="gen-grid">
                {generations.map(g => (
                  <div
                    key={g.id}
                    className={`gen-card ${generation === g.id ? "active" : ""}`}
                    onClick={() => setGeneration(g.id)}
                  >
                    <div className="gen-num">{g.label}</div>
                    <div className="gen-sub">{g.sub}</div>
                  </div>
                ))}
              </div>
              <button
                className={`next-btn ${generation ? "ready" : ""}`}
                onClick={() => generation && setPhase("jung")}
              >
                診断を開始する ✦
              </button>
            </div>
          )}

          {/* JUNG QUESTIONS */}
          {phase === "jung" && currentQuestion && (
            <div className="card" style={{ opacity: animating ? 0.6 : 1, transition: "opacity 0.3s" }}>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="progress-text">{answeredQ} / {totalQ} 問</div>

              <div className="phase-label">Step 3 / 4　— ユング心理機能診断</div>
              <div className="theme-tag">テーマ：{currentQuestion.theme}</div>
              <div className="question-text">{currentQuestion.question}</div>

              {currentQuestion.options.map(opt => (
                <button
                  key={opt.label}
                  className={`option-btn ${selected === opt.type ? "selected" : ""}`}
                  onClick={() => handleAnswer(opt.type)}
                >
                  <span className="option-label">{opt.label}</span>
                  <span>{opt.text}</span>
                </button>
              ))}
            </div>
          )}

          {/* BIAS INTRO */}
          {phase === "bias_intro" && (
            <div className="card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>⚖️</div>
              <div className="section-title">次のフェーズへ</div>
              <div className="section-desc">
                ユング診断が完了しました。<br />
                次は「意思決定パターン」の診断です。<br />
                日常のシナリオにどう反応するか教えてください。
              </div>
              <button className="intro-btn" onClick={() => { setPhase("bias"); }}>
                続ける ✦
              </button>
            </div>
          )}

          {/* BIAS QUESTIONS */}
          {phase === "bias" && currentQuestion && (
            <div className="card" style={{ opacity: animating ? 0.6 : 1, transition: "opacity 0.3s" }}>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="progress-text">{answeredQ} / {totalQ} 問</div>

              <div className="phase-label">Step 4 / 4　— 行動経済学バイアス診断</div>
              <div className="theme-tag">テーマ：{currentQuestion.theme}</div>
              <div className="question-text">{currentQuestion.question}</div>

              {currentQuestion.options.map(opt => (
                <button
                  key={opt.label}
                  className={`option-btn ${selected === opt.type ? "selected" : ""}`}
                  onClick={() => handleAnswer(opt.type)}
                >
                  <span className="option-label">{opt.label}</span>
                  <span>{opt.text}</span>
                </button>
              ))}
            </div>
          )}

          {/* RESULT */}
          {phase === "result" && results && (
            <div className="card">
              <div className="orb" style={{ width: 60, height: 60, marginBottom: 20 }} />
              <div className="result-type">Your Life Oracle Profile</div>
              <div className="result-name">
                {results.isLight ? results.jungInfo?.light : results.jungInfo?.shadow}
              </div>
              <div className={`result-badge ${results.isLight ? "badge-light" : "badge-shadow"}`}>
                {results.isLight ? "✦ 光のパターン（統合）" : "◈ 影のパターン（成長の扉）"}
              </div>

              <div className="result-divider" />

              <div className="result-row">
                <span className="result-key">ユング機能タイプ</span>
                <span className="result-val">{results.jungInfo?.name}（{results.topJung}）</span>
              </div>
              <div className="result-row">
                <span className="result-key">意思決定パターン</span>
                <span className="result-val">{results.biasInfo?.name}</span>
              </div>
              <div className="result-row">
                <span className="result-key">バイアスの特性</span>
                <span className="result-val">{results.biasInfo?.desc}</span>
              </div>

              <div className="result-divider" />

              <div style={{ textAlign: "center", marginTop: 8 }}>
                <div style={{ fontSize: 13, color: "#6a5a4a", marginBottom: 16 }}>
                  このプロファイルを元に、AIが7章構成の人生指南書を生成します
                </div>
                <button className="intro-btn" style={{ marginBottom: 12 }}>
                  ✦ 人生指南書を生成する（フル版）
                </button>
                <div className="cta-text">
                  ※ フル版では職業・世代・バイアスを統合した<br />
                  あなただけの7章構成レポートが生成されます
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
