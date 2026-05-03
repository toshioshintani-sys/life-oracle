import React from "react";
import Sparkline from "./Sparkline.jsx";

const STATUS_COLORS = {
  good: { bg: "#e8f4ec", border: "#3d7a5a", icon: "🟢", label: "良好" },
  warn: { bg: "#fbf3df", border: "#b8833f", icon: "🟡", label: "要観察" },
  bad: { bg: "#f8e6e6", border: "#a05050", icon: "🔴", label: "要対応" },
  unknown: { bg: "#eeeeee", border: "#999999", icon: "⚪", label: "計測不能" },
};

function formatValue(value, format) {
  if (value === null || value === undefined) return "—";
  if (format === "percent") return `${(value * 100).toFixed(1)}%`;
  if (format === "int") return Math.round(value).toLocaleString();
  return value;
}

export default function KpiCard({ title, value, target, status, format, sparkline, sparklineDates, footnote }) {
  const c = STATUS_COLORS[status] ?? STATUS_COLORS.unknown;
  return (
    <div
      style={{
        background: c.bg,
        border: `2px solid ${c.border}`,
        borderRadius: 12,
        padding: "16px 20px",
        minWidth: 220,
        flex: 1,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ fontSize: 13, color: "#666", fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 11, color: c.border }}>{c.icon} {c.label}</div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <div style={{ fontSize: 32, fontWeight: 700, color: "#2d2318" }}>{formatValue(value, format)}</div>
        {target !== undefined && target !== null && (
          <div style={{ fontSize: 12, color: "#888" }}>目標 {formatValue(target, format)}</div>
        )}
      </div>
      <div style={{ marginTop: 8 }}>
        <Sparkline data={sparkline} dates={sparklineDates} color={c.border} format={format} />
      </div>
      {footnote && <div style={{ fontSize: 11, color: "#888", marginTop: 6 }}>{footnote}</div>}
    </div>
  );
}
