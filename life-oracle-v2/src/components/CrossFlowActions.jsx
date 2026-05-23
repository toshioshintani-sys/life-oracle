const FLOW_META = {
  mbti: {
    title: '自分のことを知る',
    desc:  '20問で思考・行動のパターンを読み解く',
  },
  situation: {
    title: '今の状況を整理する',
    desc:  '12問で今直面していることを言語化',
  },
  attack: {
    title: '誰かのことを知る',
    desc:  '12問であの人の動く理由を読み解く',
  },
};

const FLOW_ORDER = ['mbti', 'situation', 'attack'];

export function CrossFlowActions({ currentFlow, onSwitchFlow, onRetry }) {
  const others = FLOW_ORDER.filter(f => f !== currentFlow);

  return (
    <div className="cross-flow-actions">
      <p className="cross-flow-label">次はどうしますか？</p>

      <div className="cross-flow-grid">
        {others.map(flowName => {
          const meta = FLOW_META[flowName];
          if (!meta) return null;
          return (
            <button
              key={flowName}
              type="button"
              className="cross-flow-btn"
              onClick={() => onSwitchFlow?.(flowName)}
            >
              <span className="cross-flow-btn-body">
                <span className="cross-flow-btn-title">{meta.title}</span>
                <span className="cross-flow-btn-desc">{meta.desc}</span>
              </span>
              <span className="cross-flow-btn-arrow" aria-hidden="true">→</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="cross-flow-retry"
        onClick={onRetry}
      >
        最初に戻る
      </button>
    </div>
  );
}

export default CrossFlowActions;
