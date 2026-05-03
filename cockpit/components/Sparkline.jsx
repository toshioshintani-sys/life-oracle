import React from "react";

// 日付ラベル + 値目盛り付き sparkline。recharts等の依存を避けて自前で実装。
// data: 数値配列（null可）
// dates: 日付配列（"2026-05-02" 形式）。data と同じ長さ
// format: "percent" or "int"（最後の値の表示用）
export default function Sparkline({ data, dates = [], width = 220, height = 60, color = "#b8833f", format = "int" }) {
  const pts = (data || []).map((v) => (v === null || v === undefined || !Number.isFinite(v) ? null : v));
  const validPts = pts.filter((v) => v !== null);
  if (validPts.length < 2) {
    return (
      <svg width={width} height={height} style={{ display: "block" }}>
        <text x={width / 2} y={height / 2 + 4} textAnchor="middle" fill="#888" fontSize="10">
          データ不足
        </text>
      </svg>
    );
  }
  const min = Math.min(...validPts);
  const max = Math.max(...validPts);
  const range = max - min || 1;
  const PAD_LEFT = 36;
  const PAD_RIGHT = 6;
  const PAD_TOP = 8;
  const PAD_BOTTOM = 16;
  const innerW = width - PAD_LEFT - PAD_RIGHT;
  const innerH = height - PAD_TOP - PAD_BOTTOM;
  const stepX = pts.length > 1 ? innerW / (pts.length - 1) : 0;

  const fmt = (v) => {
    if (v === null || v === undefined) return "";
    if (format === "percent") return `${(v * 100).toFixed(0)}%`;
    return Math.round(v).toString();
  };

  // 折れ線をnullで分断するため、連続区間ごとにポリラインを生成
  const segments = [];
  let current = [];
  pts.forEach((v, i) => {
    if (v === null) {
      if (current.length >= 2) segments.push(current);
      current = [];
    } else {
      const x = PAD_LEFT + i * stepX;
      const y = PAD_TOP + (1 - (v - min) / range) * innerH;
      current.push({ x, y, v, i });
    }
  });
  if (current.length >= 2) segments.push(current);

  // 最後の点を強調
  const lastValidIdx = pts.map((v, i) => (v !== null ? i : -1)).filter((i) => i >= 0).pop();
  const lastX = lastValidIdx !== undefined ? PAD_LEFT + lastValidIdx * stepX : null;
  const lastY = lastValidIdx !== undefined ? PAD_TOP + (1 - (pts[lastValidIdx] - min) / range) * innerH : null;

  // 日付ラベル（最初・最後のみ表示。月/日のみ）
  const fmtDate = (s) => {
    if (!s) return "";
    const m = s.match(/(\d{4})-(\d{2})-(\d{2})/);
    return m ? `${parseInt(m[2], 10)}/${parseInt(m[3], 10)}` : s;
  };
  const firstDateLabel = dates[0] ? fmtDate(dates[0]) : "";
  const lastDateLabel = dates[dates.length - 1] ? fmtDate(dates[dates.length - 1]) : "";

  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      {/* Y軸目盛り（最大・最小値） */}
      <text x={PAD_LEFT - 4} y={PAD_TOP + 4} textAnchor="end" fontSize="9" fill="#999">
        {fmt(max)}
      </text>
      <text x={PAD_LEFT - 4} y={PAD_TOP + innerH + 3} textAnchor="end" fontSize="9" fill="#999">
        {fmt(min)}
      </text>

      {/* X軸目盛り（最初・最後の日付） */}
      <text x={PAD_LEFT} y={height - 3} textAnchor="start" fontSize="9" fill="#999">
        {firstDateLabel}
      </text>
      <text x={PAD_LEFT + innerW} y={height - 3} textAnchor="end" fontSize="9" fill="#999">
        {lastDateLabel}
      </text>

      {/* グリッド線（max/min位置） */}
      <line x1={PAD_LEFT} y1={PAD_TOP} x2={PAD_LEFT + innerW} y2={PAD_TOP} stroke="#eee" strokeWidth="1" />
      <line x1={PAD_LEFT} y1={PAD_TOP + innerH} x2={PAD_LEFT + innerW} y2={PAD_TOP + innerH} stroke="#eee" strokeWidth="1" />

      {/* 折れ線（連続区間のみ） */}
      {segments.map((seg, i) => (
        <polyline
          key={i}
          points={seg.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
        />
      ))}

      {/* 最終点 */}
      {lastX !== null && (
        <>
          <circle cx={lastX} cy={lastY} r="3" fill={color} />
          <text x={lastX} y={lastY - 6} textAnchor="middle" fontSize="10" fontWeight="600" fill={color}>
            {fmt(pts[lastValidIdx])}
          </text>
        </>
      )}
    </svg>
  );
}
