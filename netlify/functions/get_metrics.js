// netlify/functions/get_metrics.js
// 日次メトリクスCSVを読んでJSON返却するエンドポイント。
// Cockpit (W1) のデータソース。Netlify Functions v2 (Web API) 形式。
import fs from "node:fs";
import path from "node:path";

// CSV: netlify.toml の included_files で同梱される
// Functionのcwdからの相対参照（Netlifyランタイムでは process.cwd() がプロジェクトルート）
function resolveCsvPath() {
  const candidates = [
    path.join(process.cwd(), "cockpit-data", "daily_metrics.csv"),
    path.join(process.cwd(), "..", "..", "cockpit-data", "daily_metrics.csv"),
    "/var/task/cockpit-data/daily_metrics.csv",
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return candidates[0]; // 最有力候補（エラー時はこのパスが返る）
}

const NO_INDEX_HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store, no-cache, must-revalidate, private",
  "X-Robots-Tag": "noindex, nofollow",
};

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), { status, headers: NO_INDEX_HEADERS });
}

function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const header = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    const row = {};
    header.forEach((h, i) => {
      row[h] = cells[i] ?? "";
    });
    return row;
  });
}

function safeFloat(v) {
  if (v === undefined || v === null || v === "" || v === "N/A") return null;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

export default async (req) => {
  try {
    // ───── トークン認証 ─────
    const expectedToken = process.env.COCKPIT_TOKEN;
    if (!expectedToken) {
      return jsonResponse(503, {
        error: "COCKPIT_TOKEN が設定されていません（Netlify 環境変数を確認してください）",
      });
    }
    const url = new URL(req.url);
    const providedToken =
      req.headers.get("x-cockpit-token") || url.searchParams.get("token");
    if (providedToken !== expectedToken) {
      return jsonResponse(401, { error: "Unauthorized: 有効なトークンが必要です" });
    }

    const days = parseInt(url.searchParams.get("days") ?? "7", 10);

    const csvPath = resolveCsvPath();
    if (!fs.existsSync(csvPath)) {
      return jsonResponse(500, {
        error: "CSV not found",
        tried: csvPath,
        cwd: process.cwd(),
      });
    }

    const csv = fs.readFileSync(csvPath, "utf-8");
    const stats = fs.statSync(csvPath);
    const rows = parseCsv(csv);

    const recent = rows.slice(-Math.max(days, 1));
    const latest = rows[rows.length - 1] ?? null;
    const prev = rows[rows.length - 2] ?? null;

    const likeRate = safeFloat(latest?.note_like_rate);
    const completionRate = safeFloat(latest?.ga4_completion_rate);
    const xClicks = safeFloat(latest?.x_link_clicks_24h);
    const activeUsers = safeFloat(latest?.ga4_active_users_1d);
    const activeUsersPrev = safeFloat(prev?.ga4_active_users_1d);

    const kpi = {
      like_rate: {
        value: likeRate,
        target: 0.15,
        status: likeRate === null ? "unknown" : likeRate >= 0.15 ? "good" : likeRate >= 0.10 ? "warn" : "bad",
      },
      completion_rate: {
        value: completionRate,
        target: 0.50,
        status: completionRate === null ? "unknown" : completionRate >= 0.50 ? "good" : completionRate >= 0.30 ? "warn" : "bad",
      },
      x_link_clicks: {
        value: xClicks,
        status: xClicks === null ? "unknown" : xClicks > 0 ? "good" : "warn",
      },
      active_users: {
        value: activeUsers,
        prev: activeUsersPrev,
        diff: (activeUsers !== null && activeUsersPrev !== null) ? activeUsers - activeUsersPrev : null,
        status: activeUsers === null ? "unknown" : (activeUsersPrev && activeUsers >= activeUsersPrev) ? "good" : "warn",
      },
    };

    const sparklines = {
      like_rate: recent.map((r) => safeFloat(r.note_like_rate)),
      completion_rate: recent.map((r) => safeFloat(r.ga4_completion_rate)),
      x_link_clicks: recent.map((r) => safeFloat(r.x_link_clicks_24h)),
      active_users: recent.map((r) => safeFloat(r.ga4_active_users_1d)),
      dates: recent.map((r) => r.date),
    };

    const ageHours = (Date.now() - stats.mtimeMs) / 1000 / 3600;
    const freshness = {
      last_csv_update: stats.mtime.toISOString(),
      age_hours: Math.round(ageHours * 10) / 10,
      stale: ageHours > 30,
    };

    return jsonResponse(200, {
      latest_date: latest?.date ?? null,
      latest_row: latest,
      prev_row: prev,
      kpi,
      sparklines,
      freshness,
      rows_count: rows.length,
    });
  } catch (err) {
    return jsonResponse(500, { error: err.message, stack: err.stack });
  }
};
