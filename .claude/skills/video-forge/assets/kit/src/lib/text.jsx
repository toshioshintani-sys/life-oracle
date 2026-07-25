import React from 'react';
import {useEnter} from './motion.js';

// 文字/行を時間差で出す。日本語は1文字の情報量が大きいので、単語単位より文字単位が効く。
// ただし長文には使わない（読めなくなる）。

const Piece = ({children, delay, damping, from, style}) => {
  const e = useEnter(delay, {damping, from});
  return (
    <span
      style={{
        display: 'inline-block',
        opacity: e.opacity,
        transform: `translateY(${e.y}px)`,
        whiteSpace: 'pre',
        ...style,
      }}
    >
      {children}
    </span>
  );
};

// mode='char'（1文字ずつ） / mode='line'（\n 区切りで1行ずつ）
export const SplitText = ({text, delay = 0, per = 2, mode = 'char', damping = 22, from = 30, style, lineStyle}) => {
  if (mode === 'line') {
    return (
      <>
        {String(text)
          .split('\n')
          .map((line, i) => (
            <div key={`${line}-${i}`} style={lineStyle}>
              <Piece delay={delay + i * per} damping={damping} from={from} style={style}>
                {line}
              </Piece>
            </div>
          ))}
      </>
    );
  }

  return (
    <>
      {Array.from(String(text)).map((ch, i) =>
        ch === '\n' ? (
          <br key={`br-${i}`} />
        ) : (
          <Piece key={`${ch}-${i}`} delay={delay + i * per} damping={damping} from={from} style={style}>
            {ch}
          </Piece>
        ),
      )}
    </>
  );
};

// 左から書き出されるマスク。フェードより意志が強く見える。
export const Wipe = ({progress, children, style}) => (
  <div style={{clipPath: `inset(0 ${(1 - progress) * 100}% 0 0)`, ...style}}>{children}</div>
);
