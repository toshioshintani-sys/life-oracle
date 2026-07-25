import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';

// ブランドマーク。外部アセットを持たず SVG で描く（差分がテキストで追える）。
export const Mark = ({brand, size = 96}) => {
  const frame = useCurrentFrame();

  if (brand.mark === 'compass') {
    // ライフオラクル：羅針盤（ブランドシグネチャ・変更しない）
    const spin = interpolate(frame, [0, 180], [0, 24]);
    return (
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="44" fill="none" stroke={brand.accent} strokeWidth="3" />
        <circle cx="50" cy="50" r="34" fill="none" stroke={brand.accent} strokeWidth="1" opacity="0.5" />
        <g transform={`rotate(${spin} 50 50)`}>
          <path d="M50 16 L58 50 L50 84 L42 50 Z" fill={brand.accent} />
          <path d="M16 50 L50 42 L84 50 L50 58 Z" fill={brand.gold} opacity="0.85" />
        </g>
        <circle cx="50" cy="50" r="4" fill={brand.ink} />
      </svg>
    );
  }

  // サブスクやめた：断ち切るモチーフ（リングが閉じ、斜線が引かれる）
  const ring = interpolate(frame, [4, 28], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const slash = interpolate(frame, [16, 38], [0, 40], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="40" fill="none" stroke={brand.accent} strokeWidth="6" opacity="0.3" />
      <circle
        cx="50"
        cy="50"
        r="40"
        fill="none"
        stroke={brand.accent}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray="252"
        strokeDashoffset={252 * (1 - ring)}
        transform="rotate(-90 50 50)"
      />
      <line x1="30" y1="70" x2={30 + slash} y2={70 - slash} stroke={brand.gold} strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
};
