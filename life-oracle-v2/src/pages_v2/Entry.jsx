export function Entry({ onStart }) {
  return (
    <div className="entry-screen">
      <div className="entry-header">
        <h1 className="entry-title">ライフオラクル</h1>
        <p className="entry-subtitle">
          いくつかの場面を聞かせてください。<br />
          答えが積み重なったとき、見えてくるものがあります。
        </p>
      </div>

      <button className="start-button" onClick={onStart}>
        始める
      </button>

      <p className="entry-note">所要時間：約3〜5分</p>
    </div>
  );
}
