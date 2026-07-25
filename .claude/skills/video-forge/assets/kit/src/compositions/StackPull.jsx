import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Mark} from '../lib/Mark.jsx';
import {getBrand, JP_FONT} from '../lib/brand.js';
import {money, useCount, useEnter, useProgress} from '../lib/motion.js';

// 「積み上がった月額から1本を引き抜くと総額が減る」
// 主役の動き＝数字の減少。signature move＝抜いた1本の金額が年額に転がる。
//
// これは "こういう組み方をする" という見本であって、テンプレートではない。
// 次の動画は別のコンセプトで新しいファイルを書くこと（SKILL.md Step 1）。

const W = 1080;
const PAD = 84;
const ROW_H = 116;
const ROW_GAP = 20;
const ROW_SPAN = ROW_H + ROW_GAP;

// タイムライン（30fps）
const T = {
  rowsIn: 10, // 行が積み上がり始める
  totalUp: 58, // 合計のカウントアップ
  focus: 92, // 抜く1本にフォーカス
  pull: 108, // 引き抜き
  totalDown: 128, // 合計の減少
  toYear: 172, // 月額差 → 年額へ転がる
  outro: 196,
};

// 画面に出る文字と通貨は全て差し替えられる（日本語以外・円以外のプロジェクトのため）。
// props の labels は部分指定でよい（指定したキーだけ上書きされる）。
const DEFAULT_LABELS = {
  total: '毎月の合計',
  cut: 'やめた1本ぶん',
  year: '1年でこれだけ変わる',
  perMonth: '月',
  perYear: '年',
};

const Row = ({row, index, brand, isTarget, maxPrice, shiftBy, fmt}) => {
  const enter = useEnter(T.rowsIn + index * 7, {damping: 30, from: 70});
  const bar = useProgress(T.rowsIn + 4 + index * 7, 22);
  const focus = useProgress(T.focus, 10);
  const pull = useProgress(T.pull, 22);
  const shift = useProgress(T.pull + 6, 20);

  // 抜かれる行は右へ退場。残る行のうち下側は上に詰まる。
  const x = isTarget ? pull * (W + 200) : 0;
  const y = enter.y - (isTarget ? 0 : shift * shiftBy);
  const dim = isTarget ? 1 : 1 - focus * 0.55;

  return (
    <div
      style={{
        position: 'relative',
        height: ROW_H,
        marginBottom: ROW_GAP,
        opacity: enter.opacity * (isTarget ? 1 - pull : 1),
        transform: `translate(${x}px, ${y}px)`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 22,
          background: brand.card,
          border: `2px solid ${isTarget ? brand.gold : brand.cardBorder}`,
          opacity: dim,
        }}
      />
      {/* 金額に比例した実バー。長さを誇張しない（数字と一致させる） */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: (row.price / maxPrice) * (W - PAD * 2) * bar,
          borderRadius: 22,
          background: isTarget ? brand.gold : brand.accent,
          opacity: isTarget ? 0.28 + focus * 0.22 : 0.18 * dim,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 34px',
          opacity: dim,
        }}
      >
        <div style={{fontSize: 42, fontWeight: 600, color: brand.ink}}>{row.name}</div>
        <div style={{fontSize: 46, fontWeight: 800, color: isTarget ? brand.gold : brand.ink}}>{fmt(row.price)}</div>
      </div>
    </div>
  );
};

export const StackPull = ({
  brand: brandInput,
  fontFamily,
  eyebrow,
  headline,
  rows,
  targetIndex,
  closing,
  labels,
  currency,
}) => {
  // brand はプリセット名でも、その場のブランド定義オブジェクトでもよい（src/lib/brand.js）
  const brand = getBrand(brandInput);
  const L = {...DEFAULT_LABELS, ...(labels ?? {})};
  const fmt = (n) => money(n, currency);
  const frame = useCurrentFrame();

  const total = rows.reduce((s, r) => s + r.price, 0);
  const cut = rows[targetIndex].price;
  const after = total - cut;
  const maxPrice = Math.max(...rows.map((r) => r.price));

  const countUp = useCount({from: 0, to: total, start: T.totalUp, duration: 26});
  const countDown = useCount({from: total, to: after, start: T.totalDown, duration: 28});
  const shown = frame < T.totalDown ? countUp : countDown;

  const diffIn = useEnter(T.totalDown + 18, {damping: 24, from: 50});
  const yearP = useProgress(T.toYear, 22);
  const diffValue = useCount({from: cut, to: cut * 12, start: T.toYear, duration: 22});
  const outro = useEnter(T.outro, {damping: 22, from: 30});

  // 抜いた行より下にある行が詰め上がる距離
  const shiftBy = ROW_SPAN;
  // 抜けた1行ぶんの空白を残さない：下のブロックも一緒に詰め上げる
  const shiftRest = useProgress(T.pull + 6, 20) * ROW_SPAN;

  // 冒頭は問い（0フレーム目から成立させる）。合計が出る直前に入れ替わる。
  const lead = useProgress(T.totalUp - 14, 12);
  // 積み上がりに合わせて全体がせり上がる＝0f では画面中央に問いが座る
  const rise = interpolate(useProgress(T.rowsIn - 4, 26), [0, 1], [300, 0]);

  return (
    <AbsoluteFill
      style={{
        fontFamily: fontFamily ?? JP_FONT,
        color: brand.ink,
        background: `linear-gradient(165deg, ${brand.bgFrom} 0%, ${brand.bgTo} 100%)`,
      }}
    >
      {/* 0フレーム目から成立させる：マークと問いはアニメーションさせない */}
      <AbsoluteFill style={{padding: `150px ${PAD}px`, transform: `translateY(${rise}px)`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 26, marginBottom: 30}}>
          <Mark brand={brand} size={78} />
          <div style={{fontSize: 38, letterSpacing: 4, color: brand.accent, fontWeight: 700}}>{eyebrow}</div>
        </div>

        {/* 問い → 合計 の入れ替え。高さを固定して画面が跳ねないようにする */}
        <div style={{position: 'relative', height: 230}}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 1 - lead,
              fontSize: 96,
              fontWeight: 800,
              lineHeight: 1.2,
              whiteSpace: 'pre-line',
            }}
          >
            {headline}
          </div>
          <div style={{position: 'absolute', inset: 0, opacity: lead}}>
            <div style={{fontSize: 40, color: brand.inkMuted, marginBottom: 6}}>{L.total}</div>
            <div
              style={{
                fontSize: 140,
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: -2,
                color: frame >= T.totalDown ? brand.accent : brand.ink,
              }}
            >
              {fmt(shown)}
            </div>
          </div>
        </div>

        <div style={{marginTop: 40}}>
          {rows.map((row, i) => (
            <Row
              key={row.name}
              row={row}
              index={i}
              brand={brand}
              isTarget={i === targetIndex}
              maxPrice={maxPrice}
              shiftBy={i > targetIndex ? shiftBy : 0}
              fmt={fmt}
            />
          ))}
        </div>

        {/* 抜いた1本の金額が、そのまま年額へ転がる（signature move） */}
        <div
          style={{
            marginTop: 24,
            transformOrigin: 'left center',
            opacity: diffIn.opacity,
            transform: `translateY(${diffIn.y - shiftRest}px) scale(${interpolate(yearP, [0, 1], [1, 1.08])})`,
          }}
        >
          <div style={{fontSize: 44, color: brand.inkMuted, marginBottom: 8}}>
            {yearP > 0.5 ? L.year : L.cut}
          </div>
          <div style={{fontSize: 116, fontWeight: 800, color: brand.gold, letterSpacing: -1}}>
            −{fmt(diffValue)}
            <span style={{fontSize: 48, fontWeight: 700, color: brand.inkMuted, marginLeft: 14}}>
              / {yearP > 0.5 ? L.perYear : L.perMonth}
            </span>
          </div>
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 108}}>
        <div style={{opacity: outro.opacity, transform: `translateY(${outro.y}px)`, textAlign: 'center'}}>
          <div style={{fontSize: 42, fontWeight: 700, marginBottom: 12}}>{closing}</div>
          {/* 名前・URL は未設定なら出さない（ブランド定義が無いプロジェクトでも成立させる） */}
          <div style={{fontSize: 34, color: brand.inkMuted, letterSpacing: 2}}>
            {[brand.name, brand.url].filter(Boolean).join(' / ')}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const meta = {
  id: 'StackPull',
  component: StackPull,
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: 240,
  defaultProps: {
    brand: 'subsuku',
    eyebrow: '固定費、動かす',
    headline: '毎月、\n何にいくら？',
    rows: [
      {name: '動画配信', price: 1026},
      {name: '音楽', price: 1080},
      {name: 'クラウド保存', price: 1300},
      {name: '読み放題', price: 980},
      {name: '使ってないアプリ', price: 1490},
    ],
    targetIndex: 4,
    closing: '解約手順をまとめています',
  },
};
