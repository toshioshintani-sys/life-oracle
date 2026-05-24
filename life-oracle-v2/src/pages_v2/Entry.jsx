import { useEffect, useState } from 'react';
import { getDiagnosisStats } from '../lib/stats.js';

function formatCount(n) {
  if (n >= 10000) return `${Math.floor(n / 1000) / 10}万`;
  if (n >= 1000)  return n.toLocaleString();
  return String(n);
}

const CHOICES = [
  {
    flow:  'mbti',
    glyph: '◐',
    title: '自分の動き方を知りたい',
    desc:  'なぜ自分はこう動くのか。思考と行動のパターンを読み解く',
    meta:  '約20問',
  },
  {
    flow:  'situation',
    glyph: '◍',
    title: '今のモヤモヤを整理したい',
    desc:  '言葉にならない感情の、根っこにあるものを見つける',
    meta:  '約12問',
  },
  {
    flow:  'attack',
    glyph: '◉',
    title: 'あの人を攻略したい',
    desc:  'あの人がそう動く理由と、通じる一言',
    meta:  '約12問',
  },
];

export function Entry({ onStart, onOpenNoteIndex }) {
  const [totalCount, setTotalCount] = useState(null);

  useEffect(() => {
    getDiagnosisStats().then(stats => {
      if (stats && stats.total > 0) setTotalCount(stats.total);
    });
  }, []);

  return (
    <div className="entry-screen">
      <div className="entry-header">
        <span className="entry-mark" aria-hidden="true">✣</span>
        <h1 className="entry-title">ライフオラクル</h1>
        <p className="entry-tagline">あなたのことを、静かに読み取ります。</p>
        <p className="entry-barnum">何かが少しずつ動き始めている、そんな時期に来る人が多いです。</p>
        {totalCount !== null && (
          <p className="entry-stat">これまでに <strong>{formatCount(totalCount)}人</strong> が自分を読みました</p>
        )}
      </div>

      <div className="entry-choices">
        {CHOICES.map((c, i) => (
          <button
            key={c.flow}
            className="entry-choice-button"
            style={{ animationDelay: `${0.08 * (i + 1)}s` }}
            onClick={() => onStart(c.flow)}
          >
            <span className="choice-glyph" aria-hidden="true">{c.glyph}</span>
            <span className="choice-body">
              <span className="choice-title">{c.title}</span>
              <span className="choice-desc">{c.desc}</span>
            </span>
            <span className="choice-meta">{c.meta}</span>
          </button>
        ))}
      </div>

      <button className="entry-note-link" onClick={onOpenNoteIndex}>
        note 記事まとめを読む →
      </button>
    </div>
  );
}
