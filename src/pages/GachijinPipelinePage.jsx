// ガチ人パイプライン管理ページ（ローカル専用 → スタブ）
// 実体は開発環境のみ。本番では /gachijin へのアクセスはこの画面を返す。
export default function GachijinPipelinePage() {
  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif', color: '#2d2318' }}>
      <h1 style={{ color: '#b8833f' }}>Gachijin Pipeline</h1>
      <p>このページはローカル環境専用です。</p>
    </div>
  );
}
