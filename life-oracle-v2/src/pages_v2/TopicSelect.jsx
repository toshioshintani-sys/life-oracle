const TOPICS = [
  { id: 'work',     label: '仕事のこと',   desc: '職場・キャリア・働き方' },
  { id: 'relation', label: '人間関係',     desc: 'パートナー・家族・友人' },
  { id: 'self',     label: '自分のこと',   desc: '感情・自信・エネルギー' },
  { id: 'future',   label: '将来のこと',   desc: '選択・変化・これから'   },
];

export function TopicSelect({ onSelect, onBack, okMessage }) {
  return (
    <div className="topic-screen">
      <button className="back-button" onClick={onBack}>もどる</button>
      {okMessage && <p className="topic-ok-message">{okMessage}</p>}
      <p className="topic-lead">今、気になっているのはどの領域ですか？</p>
      <div className="topic-choices">
        {TOPICS.map(t => (
          <button key={t.id} className="topic-button" onClick={() => onSelect(t.id)}>
            <span className="topic-label">{t.label}</span>
            <span className="topic-desc">{t.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
