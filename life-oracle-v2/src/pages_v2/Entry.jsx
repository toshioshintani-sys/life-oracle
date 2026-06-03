import { useEffect, useState } from 'react';
import { getDiagnosisStats } from '../lib/stats.js';

function formatCount(n) {
  if (n >= 10000) return `${Math.floor(n / 1000) / 10}万`;
  if (n >= 1000)  return n.toLocaleString();
  return String(n);
}

// 疑似乱数だが決定論的（SSR/再レンダリングで位置が変わらない）
const STARS = Array.from({ length: 14 }, (_, i) => ({
  top:   `${6 + (i * 743 % 28)}%`,
  left:  `${8 + (i * 531 % 84)}%`,
  delay: `${(i * 0.41) % 3}s`,
  size:  i % 4 === 0 ? '2px' : '1.5px',
}));

const CHOICES = [
  {
    flow:  'mbti',
    kanji: '自',
    title: '自分を知る',
    desc:  '思考と行動のパターンを読み解く',
    hint:  '約20問',
  },
  {
    flow:  'situation',
    kanji: '状',
    title: '状況を知る',
    desc:  '言葉にならない感情の根っこを見つける',
    hint:  '約12問',
  },
  {
    flow:  'attack',
    kanji: '相',
    title: '相手を知る',
    desc:  'その人がそう動く理由と通じる一言',
    hint:  '約12問',
  },
];

const NOTE_INDEX_START = new Date('2026-05-29T00:00:00+09:00');

export function Entry({ onStart, onOpenNoteIndex }) {
  const [totalCount, setTotalCount] = useState(null);
  const showNoteIndex = new Date() >= NOTE_INDEX_START;

  useEffect(() => {
    getDiagnosisStats().then(stats => {
      if (stats?.total > 0) setTotalCount(stats.total);
    }).catch(() => {});
  }, []);

  return (
    <div className="entry-screen">

      {/* 星 */}
      <div className="entry-stars" aria-hidden="true">
        {STARS.map((s, i) => (
          <span
            key={i}
            className="entry-star"
            style={{ top: s.top, left: s.left, animationDelay: s.delay, width: s.size, height: s.size }}
          />
        ))}
      </div>

      {/* ヘッダー */}
      <header className="entry-header">
        {/* 羅針盤モチーフ */}
        <div className="entry-compass" aria-hidden="true">
          <div className="entry-compass-ring1" />
          <div className="entry-compass-ring2" />
          <div className="entry-compass-core">
            <div className="entry-compass-diamond" />
          </div>
          <span className="entry-compass-n">N</span>
        </div>

        <p className="entry-en">LIFE ORACLE</p>
        <h1 className="entry-title">ライフオラクル</h1>
        <div className="entry-rule" />
        <p className="entry-tagline">あなたのことを、静かに読み取ります。</p>
        {totalCount !== null && (
          <p className="entry-stat">
            <strong>{formatCount(totalCount)}人</strong>が自分を読みました
          </p>
        )}
      </header>

      {/* 3択 */}
      <nav className="entry-choices" aria-label="診断の種類を選ぶ">
        {CHOICES.map((c, i) => (
          <button
            key={c.flow}
            className="entry-choice-button"
            style={{ animationDelay: `${0.1 * (i + 1)}s` }}
            onClick={() => onStart(c.flow)}
          >
            <span className="choice-kanji" aria-hidden="true">{c.kanji}</span>
            <span className="choice-body">
              <span className="choice-title">{c.title}</span>
              <span className="choice-desc">{c.desc}</span>
            </span>
            <span className="choice-hint">{c.hint}</span>
          </button>
        ))}
      </nav>

      {showNoteIndex && (
        <button className="entry-note-link" onClick={onOpenNoteIndex}>
          note 記事まとめを読む →
        </button>
      )}
    </div>
  );
}
