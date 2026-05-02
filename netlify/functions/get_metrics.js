// netlify/functions/get_metrics.js
// 日次メトリクスCSVを読んでJSON返却するエンドポイント。
// Cockpit (W1) のデータソース。
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CSVは life-oracle リポジトリの cockpit-data/ にコミットされる
// Netlify上ではfunctionsディレクトリの外側を辿って取得
const CSV_PATH = path.resolve(__dirname, "../../cockpit-data/daily_metrics.csv");

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const header = lines[0].split(",");
  return lines.slice(1).map((line) => {
    // 簡易CSVパーサ（フィールド内にカンマがある場合は要注意。今回は安全な形式想定）
    const cells = parseCsvLine(line);
    const row = {};
    header.forEach((h, i) => {
      row[h] = cells[i] ?? "";
    });
    return row;
  });
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

function safeFloat(v) {
  if (v === undefined || v === null || v === "" || v === "N/A") return null;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

// 共通レスポンスヘッダー
const NO_INDEX_HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store, no-cache, must-revalidate, private",
  "X-Robots-Tag": "noindex, nofollow",
};

export const handler = async (event) => {
  try {
    // ───── トークン認証 ─────
    // COCKPIT_TOKEN は Netlify 環境変数で設定（GitHub にコミットしない）
    const expectedToken = process.env.COCKPIT_TOKEN;
    if (!expectedToken) {
      return {
        statusCode: 503,
        headers: NO_INDEX_HEADERS,
        body: JSON.stringify({ error: "COCKPIT_TOKEN が設定されていません（Netlify 環境変数を確認）" }),
      };
    }
    const providedToken =
      event.headers?.["x-cockpit-token"] ||
      event.headers?.["X-Cockpit-Token"] ||
      event.queryStringParameters?.token;
    if (providedToken !== expectedToken) {
      return {
        statusCode: 401,
        headers: NO_INDEX_HEADERS,
        body: JSON.stringify({ error: "Unauthorized: 有効なトークンが必要です" }),
      };
    }

    const days = parseInt(event.queryStringParameters?.days ?? "7", 10);

    if (!fs.existsSync(CSV_PATH)) {
      return {
        statusCode: 500,
        headers: NO_INDEX_HEADERS,
        body: JSON.stringify({ error: "CSV not found", path: CSV_PATH }),
      };
    }

    const csv = fs.readFileSync(CSV_PATH, "utf-8");
    const stats = fs.statSync(CSV_PATH);
    const rows = parseCsv(csv);

    const recent = rows.slice(-Math.max(days, 1));
    const latest = rows[rows.length - 1] ?? null;
    const prev = rows[rows.length - 2] ?? null;

    // KPI算出
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

    // sparkline用の時系列
    const sparklines = {
      like_rate: recent.map((r) => safeFloat(r.note_like_rate)),
      completion_rate: recent.map((r) => safeFloat(r.ga4_completion_rate)),
      x_link_clicks: recent.map((r) => safeFloat(r.x_link_clicks_24h)),
      active_users: recent.map((r) => safeFloat(r.ga4_active_users_1d)),
      dates: recent.map((r) => r.date),
    };

    // CSV鮮度（24時間以上更新されていなければ警告）
    const ageHours = (Date.now() - stats.mtimeMs) / 1000 / 3600;
    const freshness = {
      last_csv_update: stats.mtime.toISOString(),
      age_hours: Math.round(ageHours * 10) / 10,
      stale: ageHours > 30, // バッチが朝6:30→翌日6:30で約24時間。30時間超えたら警告
    };

    return {
      statusCode: 200,
      headers: NO_INDEX_HEADERS,
      body: JSON.stringify({
        latest_date: latest?.date ?? null,
        latest_row: latest,
        prev_row: prev,
        kpi,
        sparklines,
        freshness,
        rows_count: rows.length,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: NO_INDEX_HEADERS,
      body: JSON.stringify({ error: err.message, stack: err.stack }),
    };
  }
};
