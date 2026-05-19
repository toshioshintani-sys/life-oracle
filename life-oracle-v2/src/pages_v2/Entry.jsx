export function Entry({ onStart }) {
  return (
    <div className="entry-screen">
      <div className="entry-header">
        <h1 className="entry-title">ライフオラクル</h1>
        <p className="entry-tagline">あなたのことを、静かに読み取ります。</p>
        <p className="entry-barnum">何かが少しずつ動き始めている、そんな時期に来る人が多いです。</p>
      </div>

      <div className="entry-choices">
        <button className="entry-choice-button" onClick={() => onStart('mbti')}>
          <span className="choice-title">自分のことを知りたい</span>
          <span className="choice-desc">思考・行動のパターンを読み解く<br />約12問</span>
        </button>
        <button className="entry-choice-button" onClick={() => onStart('situation')}>
          <span className="choice-title">今の状況を整理したい</span>
          <span className="choice-desc">今感じていることを言語化する<br />約8問</span>
        </button>
        <button className="entry-choice-button" onClick={() => onStart('attack')}>
          <span className="choice-title">誰かを攻略したい</span>
          <span className="choice-desc">あの人がそう動く理由と通じ方<br />約6問</span>
        </button>
      </div>
    </div>
  );
}
