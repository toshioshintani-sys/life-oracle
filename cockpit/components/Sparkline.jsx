import React from "react";

// 簡易スパークライン (SVG)。recharts等の依存を避けて自前で実装。
export default function Sparkline({ data, width = 160, height = 36, color = "#b8833f" }) {
  const pts = (data || []).filter((v) => v !== null && v !== undefined && Number.isFinite(v));
  if (pts.length < 2) {
    return (
      <svg width={width} height={height} style={{ display: "block" }}>
        <text x={width / 2} y={height / 2 + 4} textAnchor="middle" fill="#888" fontSize="10">
          データ不足
        </text>
      </svg>
    );
  }
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const range = max - min || 1;
  const stepX = pts.length > 1 ? width / (pts.length - 1) : 0;
  const points = pts
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * (height - 6) - 3;
      return `${x},${y}`;
    })
    .join(" ");
  const lastX = (pts.length - 1) * stepX;
  const lastY = height - ((pts[pts.length - 1] - min) / range) * (height - 6) - 3;
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" />
      <circle cx={lastX} cy={lastY} r="2.5" fill={color} />
    </svg>
  );
}
