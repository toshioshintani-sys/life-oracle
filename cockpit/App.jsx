import React, { useEffect, useState } from "react";
import KpiCard from "./components/KpiCard.jsx";

const TOKEN_STORAGE_KEY = "lifeoracle_cockpit_token";

export default function App() {
  const [token, setToken] = useState(null);
  const [tokenInput, setTokenInput] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [authError, setAuthError] = useState(null);

  // 初回マウント時：URLパラメータ or localStorage からトークン取得
  useEffect(() => {
    const url = new URL(window.location.href);
    const urlToken = url.searchParams.get("token");
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    const t = urlToken || storedToken;
    if (t) {
      // URLからトークンが来た場合はlocalStorageに保存してURLから消す（履歴に残さない）
      if (urlToken) {
        localStorage.setItem(TOKEN_STORAGE_KEY, urlToken);
        url.searchParams.delete("token");
        window.history.replaceState({}, "", url.toString());
      }
      setToken(t);
    }
  }, []);

  // トークン取得後にデータ取得
  useEffect(() => {
    if (!token) return;
    fetchMetrics();
  }, [token]);

  async function fetchMetrics() {
    setLoading(true);
    setError(null);
    setAuthError(null);
    try {
      const res = await fetch("/.netlify/functions/get_metrics?days=7", {
        headers: { "X-Cockpit-Token": token },
      });
      if (res.status === 401) {
        // トークン不正 → クリアして再入力を求める
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
        setAuthError("トークンが無効です。正しいトークンを入力してください。");
        return;
      }
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (e) {
      // localhost開発時はモックデータでUIを確認できるようフォールバック
      if (typeof window !== "undefined" && window.location.hostname === "localhost") {
        setData(MOCK_DATA);
        setError(`(開発モード) Netlify Function未起動のためモックデータ表示中: ${e.message}`);
      } else {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleTokenSubmit(e) {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    localStorage.setItem(TOKEN_STORAGE_KEY, tokenInput.trim());
    setToken(tokenInput.trim());
    setTokenInput("");
  }

  function handleLogout() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setData(null);
  }

  const MOCK_DATA = {
    latest_date: "2026-05-02",
    latest_row: {
      date: "2026-05-02",
      ga4_sessions_1d: "9",
      ga4_avg_engagement_sec: "16.92",
      ga4_diag_start: "1",
      ga4_diag_complete: "1",
      x_followers: "63",
      x_impressions_24h: "308",
      note_followers: "63",
      note_pv_24h: "1152",
      top_note_article_title: "「なんかこの職場、合わない」と感じる理由を心理学で解説する",
      top_note_article_pv: "149",
    },
    kpi: {
      like_rate: { value: 0.196, target: 0.15, status: "good" },
      completion_rate: { value: 1.0, target: 0.5, status: "good" },
      x_link_clicks: { value: null, status: "unknown" },
      active_users: { value: 7, prev: 4, diff: 3, status: "good" },
    },
    sparklines: {
      like_rate: [0.155, 0.154, 0.158, 0.162, 0.180, 0.190, 0.196],
      completion_rate: [null, null, 0.5, 0.6, 0.8, 0.9, 1.0],
      x_link_clicks: [0, 0, 1, 0, 2, 1, null],
      active_users: [1, 2, 3, 4, 5, 4, 7],
      dates: ["04-26", "04-27", "04-28", "04-29", "04-30", "05-01", "05-02"],
    },
    freshness: { last_csv_update: new Date().toISOString(), age_hours: 0.5, stale: false },
  };

  // 開発モード（localhost）でトークン未設定 → モックUIを直接表示
  const isLocal = typeof window !== "undefined" && window.location.hostname === "localhost";
  useEffect(() => {
    if (isLocal && !token && !data) {
      setData(MOCK_DATA);
      setError("(開発モード) localhost のためトークン認証スキップ。モックデータ表示中");
    }
  }, []);

  // トークン未設定 → ログイン画面
  if (!token && !isLocal) {
    return (
      <div style={{ maxWidth: 480, margin: "120px auto", textAlign: "center", padding: 20 }}>
        <h1 style={{ fontFamily: "'Noto Serif JP', serif", color: "#2d2318" }}>ライフオラクル Cockpit</h1>
        <p style={{ color: "#666", fontSize: 14 }}>俊雄さん専用ダッシュボード</p>
        {authError && (
          <div style={{ background: "#f8e6e6", border: "1px solid #a05050", padding: 12, borderRadius: 8, color: "#a05050", margin: "16px 0", fontSize: 13 }}>
            ❌ {authError}
          </div>
        )}
        <form onSubmit={handleTokenSubmit} style={{ marginTop: 24 }}>
          <input
            type="password"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="アクセストークンを入力"
            autoFocus
            style={{
              width: "100%",
              padding: "12px 16px",
              fontSize: 14,
              border: "1px solid #b8833f",
              borderRadius: 6,
              fontFamily: "monospace",
              boxSizing: "border-box",
            }}
          />
          <button
            type="submit"
            style={{
              marginTop: 12,
              padding: "12px 32px",
              background: "#b8833f",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              cursor: "pointer",
              width: "100%",
            }}
          >
            ログイン
          </button>
        </form>
        <p style={{ color: "#999", fontSize: 11, marginTop: 24 }}>
          初回は <code>?token=&lt;トークン&gt;</code> をURLに付けてアクセスすると自動入力されます。
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Noto Serif JP', serif", color: "#2d2318", margin: 0, fontSize: 24 }}>
            ライフオラクル Cockpit
          </h1>
          <p style={{ color: "#888", margin: "4px 0 0", fontSize: 13 }}>
            {data?.latest_date ? `最新データ: ${data.latest_date}` : "—"}
            {data?.freshness?.stale && (
              <span style={{ color: "#a05050", marginLeft: 12 }}>
                ⚠️ CSV更新が {data.freshness.age_hours}h 前で古い
              </span>
            )}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={fetchMetrics}
            disabled={loading}
            style={{
              padding: "8px 16px",
              background: "white",
              border: "1px solid #b8833f",
              color: "#b8833f",
              borderRadius: 6,
              cursor: loading ? "wait" : "pointer",
              fontSize: 13,
            }}
          >
            {loading ? "更新中..." : "🔄 更新"}
          </button>
          {!isLocal && (
            <button
              onClick={handleLogout}
              style={{
                padding: "8px 16px",
                background: "white",
                border: "1px solid #999",
                color: "#666",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              ログアウト
            </button>
          )}
        </div>
      </header>

      {error && (
        <div style={{ background: "#fbf3df", border: "1px solid #b8833f", padding: 16, borderRadius: 8, color: "#8c5f28", marginBottom: 24, fontSize: 13 }}>
          ⚠️ {error}
        </div>
      )}

      {!data && !error && (
        <div style={{ textAlign: "center", padding: 60, color: "#888" }}>読み込み中...</div>
      )}

      {data && (
        <>
          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 16, color: "#666", marginBottom: 12 }}>📊 主要KPI（直近7日推移）</h2>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <KpiCard
                title="noteスキ率（週次）"
                value={data.kpi.like_rate.value}
                target={data.kpi.like_rate.target}
                status={data.kpi.like_rate.status}
                format="percent"
                sparkline={data.sparklines.like_rate}
                sparklineDates={data.sparklines.dates}
                footnote="目標15%以上 = 高品質シグナル"
              />
              <KpiCard
                title="診断完了率"
                value={data.kpi.completion_rate.value}
                target={data.kpi.completion_rate.target}
                status={data.kpi.completion_rate.status}
                format="percent"
                sparkline={data.sparklines.completion_rate}
                sparklineDates={data.sparklines.dates}
                footnote="完了/開始（GA4イベント計測）"
              />
              <KpiCard
                title="X→note クリック"
                value={data.kpi.x_link_clicks.value}
                status={data.kpi.x_link_clicks.status}
                format="int"
                sparkline={data.sparklines.x_link_clicks}
                sparklineDates={data.sparklines.dates}
                footnote="X送客KPI（24h）"
              />
              <KpiCard
                title="アクティブユーザー"
                value={data.kpi.active_users.value}
                status={data.kpi.active_users.status}
                format="int"
                sparkline={data.sparklines.active_users}
                sparklineDates={data.sparklines.dates}
                footnote={
                  data.kpi.active_users.diff !== null && data.kpi.active_users.diff !== undefined
                    ? `前日比 ${data.kpi.active_users.diff >= 0 ? "+" : ""}${data.kpi.active_users.diff.toFixed(0)}人`
                    : "前日比データなし"
                }
              />
            </div>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 16, color: "#666", marginBottom: 12 }}>📝 今週のベスト記事</h2>
            <div style={{ background: "white", padding: 16, borderRadius: 8, border: "1px solid #e0d8c8" }}>
              <div style={{ fontSize: 18, fontWeight: 600 }}>
                {data.latest_row?.top_note_article_title || "—"}
              </div>
              <div style={{ color: "#888", marginTop: 4 }}>
                PV {data.latest_row?.top_note_article_pv || "—"}
              </div>
            </div>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 16, color: "#666", marginBottom: 12 }}>🌐 今日の数値（生データ）</h2>
            <div style={{ background: "white", padding: 16, borderRadius: 8, border: "1px solid #e0d8c8", fontSize: 13, lineHeight: 1.8 }}>
              <div>セッション数: {data.latest_row?.ga4_sessions_1d || "—"}</div>
              <div>平均エンゲージメント時間: {data.latest_row?.ga4_avg_engagement_sec || "—"}秒</div>
              <div>診断ファネル: {data.latest_row?.ga4_diag_start || 0} 開始 → {data.latest_row?.ga4_diag_complete || 0} 完了</div>
              <div>Xフォロワー: {data.latest_row?.x_followers || "—"}人 / インプレッション: {data.latest_row?.x_impressions_24h || "—"}</div>
              <div>noteフォロワー: {data.latest_row?.note_followers || "—"}人 / 週次PV: {data.latest_row?.note_pv_24h || "—"}</div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
