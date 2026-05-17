// 結果生成 — intent（悩み）を起点にした物語テキスト
// タイプ名は見出しではなく「説明の理由」として登場する

import { cognitiveFunctionMap, famousPeople, biasInfo } from '../data_v2/index.js';
import { topBiases } from './biasScorer.js';

// ─── 軸の傾向ラベル ───────────────────────────────────────────

const AXIS_LABEL = {
  E: '周囲との関わりでエネルギーが湧くタイプ',
  I: '一人の時間で回復するタイプ',
  S: '目の前の事実や経験を積み上げるタイプ',
  N: '全体像や将来のパターンから考えるタイプ',
  T: '論理と事実を判断の軸にするタイプ',
  F: '場の空気と人の気持ちを判断の軸にするタイプ',
  J: '決めて進めることで安心するタイプ',
  P: '状況を見ながら柔軟に動くタイプ',
};

// ─── intent × JP/TF 軸で「なぜその悩みが生まれるか」を語るテンプレート ───

function whyItHurts(intent, mbtiType) {
  const jp = mbtiType[3]; // J or P
  const tf = mbtiType[2]; // T or F
  const ei = mbtiType[0]; // E or I
  const sn = mbtiType[1]; // S or N

  const templates = {
    work_stress: {
      J: {
        T: `計画通りに進まないことへの苦痛と、感情的なやりとりへの消耗が重なっているはずです。「段取りが崩れる」「非論理的な判断が通る」——この2つがあなたのストレスの大部分を占めています。`,
        F: `予定が狂うストレスと、その場の人間関係の不和を同時に感じている状態です。「なぜ事前に決めておかないのか」という苛立ちと、「空気を壊したくない」という気持ちが衝突しています。`,
      },
      P: {
        T: `細かいルールや報告義務、変えられない手順に縛られるほど、あなたの本来の力が出しにくくなります。論理的には正しいと分かっていても、そのやり方を強いられることへの消耗感があります。`,
        F: `「もっと自由にやればうまくいく」という感覚と、「でも周りに合わせなきゃ」という板挟みです。やりたいことと、求められていることのズレがストレスの正体です。`,
      },
    },
    relation_conflict: {
      J: {
        T: `相手が「なぜそう考えるのか」が論理的に理解できないとき、あなたは相手との距離を感じます。感情の話をされると「それで結局どうしたいの？」と思ってしまいやすい。`,
        F: `相手に対して誠実に向き合っているのに、それが伝わらないときの傷つきは大きいはずです。「もっと分かり合えるはずなのに」という期待と現実のギャップが痛みの源です。`,
      },
      P: {
        T: `あなたは相手に合わせるより、正しいことを正しいと言いたいタイプです。それがときに「冷たい」「共感がない」と受け取られ、すれ違いが生まれます。`,
        F: `相手の気持ちをとても大切にするため、関係がうまくいかないと「自分のせいかも」と引き受けすぎることがあります。`,
      },
    },
    self_understand: {
      J: {
        T: `あなたは「なぜそうなのか」を論理で説明できないと、自分のことでも納得しにくい。感情より先に「理由」を求めてしまいます。`,
        F: `他人の気持ちには敏感なのに、自分自身の感情については言語化しにくいことがあります。「なんとなく辛い」が続くのに原因が見えない、という経験があるはずです。`,
      },
      P: {
        T: `「自分はこうだ」と決めつけることへの抵抗があります。あらゆる可能性を捨てたくないから、自己理解も"暫定版"であることが多い。`,
        F: `状況によって自分の感じ方が変わりすぎて、「本当の自分はどっちだろう」と混乱することがあります。`,
      },
    },
    future_decision: {
      J: {
        T: `選択肢を論理的に比較して「これが正解」と決めても、何か引っかかる感じが残ることがあります。あなたにとって決断は「決めた後に動けるか」が本当の問いです。`,
        F: `決め方は分かっていても「これで人を傷つけないか」が気になって、なかなか踏み出せないことがあります。`,
      },
      P: {
        T: `可能性を絞るのが苦手なため、「もっと情報を集めてから」と先延ばしになりやすい。実は情報不足ではなく、決めること自体への抵抗が正体です。`,
        F: `「どちらが正しいか」より「どちらが心地よいか」を大切にしたい。でも周りの期待や正解っぽい答えに引っ張られて、自分の軸が見えにくくなることがあります。`,
      },
    },
  };

  return (
    templates[intent]?.[jp]?.[tf] ??
    `あなたの動き方には、${AXIS_LABEL[jp]}という特徴が関係しています。`
  );
}

// ─── intent × EI/SN でリカバリーヒントを生成 ───────────────────

function recoveryHint(intent, mbtiType) {
  const ei = mbtiType[0];
  const sn = mbtiType[1];

  const hints = {
    work_stress: {
      E: { S: '信頼できる同僚に状況を話すと、問題の輪郭が見えてきます。',
           N: 'チームの方向性について率直に話せる場を作ると、ストレスが下がります。' },
      I: { S: '一人でタスクを整理し直す時間を15分でも確保すると回復します。',
           N: '問題の根本原因を一人で分析する時間が、あなたのストレス対処になります。' },
    },
    relation_conflict: {
      E: { S: '相手と過去の具体的なエピソードを話し直すと、ずれが見つかります。',
           N: '「お互い何を大事にしているか」を言語化する会話が突破口になります。' },
      I: { S: '一対一で静かな場所での対話が、あなたの本音を引き出しやすくします。',
           N: '文章や手紙で気持ちを整理してから伝えると、うまく届きやすいです。' },
    },
    self_understand: {
      E: { S: '身近な人に「自分ってどう見える？」と聞いてみるのが近道です。',
           N: '「なぜ自分はこれが好きなのか」を声に出して話すことで見えてきます。' },
      I: { S: '行動記録や日記をつけると、パターンが浮き上がってきます。',
           N: '「なぜ？」を5回繰り返すような一人思考が最も向いています。' },
    },
    future_decision: {
      E: { S: '信頼できる人に話しながら決める方が、一人で考えるより結論が出やすいです。',
           N: 'ブレストを誰かとすることで、見えていなかった選択肢が出てきます。' },
      I: { S: '選択肢を紙に書き出して、静かな場所で比較するのが最適です。',
           N: '直感が先に来ることが多いので、最初に浮かんだ答えを記録しておくことで本音が分かります。' },
    },
  };

  return hints[intent]?.[ei]?.[sn] ?? '自分の動き方を知るだけで、同じ状況でのストレスが和らぎます。';
}

// ─── バイアスが「その悩み」にどう影響しているかを語る ───────────

function biasImpact(biasKey, intent) {
  const impacts = {
    B1: {
      work_stress:       '「失うリスク」を過大に見積もるため、現状を変える判断が遅くなりやすいです。',
      relation_conflict: '関係が壊れることへの恐れが、本音を言えない状況を作っています。',
      self_understand:   '今の自分を変えることへの抵抗が、現状維持を続けさせています。',
      future_decision:   '「今持っているものを失う」恐怖が、新しい選択肢を選びにくくしています。',
    },
    B2: {
      work_stress:       '重要だが緊急でないことを後回しにするため、いつも火消しモードになりやすいです。',
      relation_conflict: '気の重い会話を「またいつか」と先延ばしにすることで、ずれが広がります。',
      self_understand:   '自己理解のための内省時間より、目の前の楽しさや緊急事項を優先しがちです。',
      future_decision:   '将来の大きな利益より今の小さな快適さを選び、決断が遠のきます。',
    },
    B6: {
      work_stress:       '慣れたやり方への執着が、より良い方法への切り替えを遅らせています。',
      relation_conflict: '今の関係のバランスを崩したくないため、必要な変化を避けてしまいます。',
      self_understand:   '「今の自分」を変えることへの抵抗が、新しい自己理解を遠ざけています。',
      future_decision:   '現状を変えないことをデフォルトにしているため、選択肢が狭まっています。',
    },
    B8: {
      work_stress:       'すでに費やした時間や労力への執着が、やめる判断を遅らせています。',
      relation_conflict: '長く続いた関係であるほど、「ここまでやったから」と問題から目を背けやすくなります。',
      self_understand:   '過去の自己イメージに縛られ、今の自分の変化を認めにくくなっています。',
      future_decision:   'すでに投資したことへの執着が、より良い選択への切り替えを妨げています。',
    },
  };

  return impacts[biasKey]?.[intent] ?? biasInfo[biasKey]?.description ?? '';
}

// ─── 公開API ─────────────────────────────────────────────────────

/**
 * 結果画面に渡すデータをまとめて返す
 */
export function buildResultData(result) {
  const { mbtiType, biasScores, intent } = result;

  const cogMap = cognitiveFunctionMap[mbtiType] ?? {};
  const famous = famousPeople[mbtiType] ?? { people: [] };
  const top2Biases = topBiases(biasScores, 2);

  const intentLabel = {
    work_stress:       '仕事のストレス・人間関係',
    relation_conflict: '家族・友人との分かり合えなさ',
    self_understand:   'なぜ自分はこうなのか',
    future_decision:   '将来の選択・迷い',
  }[intent] ?? 'あなたのこと';

  return {
    mbtiType,
    intentLabel,
    why: whyItHurts(intent, mbtiType),
    recovery: recoveryHint(intent, mbtiType),
    todayAction: cogMap.todayAction ?? '',
    famousPeople: famous.people,
    axisLabels: {
      EI: AXIS_LABEL[mbtiType[0]],
      SN: AXIS_LABEL[mbtiType[1]],
      TF: AXIS_LABEL[mbtiType[2]],
      JP: AXIS_LABEL[mbtiType[3]],
    },
    topBiases: top2Biases.map(b => ({
      key: b,
      name: biasInfo[b]?.name ?? b,
      short: biasInfo[b]?.short ?? '',
      impact: biasImpact(b, intent),
    })),
    intent,
    axisStrength: result.confidences,
  };
}
