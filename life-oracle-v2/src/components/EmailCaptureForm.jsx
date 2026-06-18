import { useState } from 'react';
import { captureEmail } from '../lib/leads.js';

/**
 * 診断結果の末尾に置くメール捕獲フォーム。
 * 「分かった直後」に続編処方箋の受け取りを提案し、再到達チャネル(メール)を得る。
 * 無料体験を一切痩せさせない＝結果は全部見せた後の純粋な「足し算」。
 */
export default function EmailCaptureForm({ flow, meta = {} }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | saving | done | error
  const [msg, setMsg] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    if (status === 'saving' || status === 'done') return;
    setStatus('saving');
    setMsg('');
    const r = await captureEmail(email, flow, meta);
    if (r.ok) {
      setStatus('done');
    } else {
      setStatus('error');
      setMsg(r.error || '保存に失敗しました');
    }
  }

  if (status === 'done') {
    return (
      <div style={S.wrap}>
        <p style={{ ...S.title, marginBottom: 4 }}>受け取りました ✓</p>
        <p style={S.note}>あなたのタイプに合わせた続編の処方箋が届いたら、最初にお知らせします。</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} style={S.wrap}>
      <p style={S.title}>続編の処方箋をメールで受け取る</p>
      <p style={S.note}>
        あなたのタイプ × 思考のクセに合わせた深掘りを、不定期でお届けします。いつでも解除できます。
      </p>
      <div style={S.row}>
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={S.input}
          disabled={status === 'saving'}
        />
        <button type="submit" style={S.btn} disabled={status === 'saving'}>
          {status === 'saving' ? '送信中…' : '受け取る'}
        </button>
      </div>
      {status === 'error' && <p style={{ ...S.note, color: '#a05050', marginTop: 8 }}>{msg}</p>}
      <p style={{ ...S.note, fontSize: 11, opacity: 0.7, marginTop: 8 }}>
        メールアドレスは続編のお知らせにのみ使用し、第三者には渡しません。
      </p>
    </form>
  );
}

const S = {
  wrap: { background: '#fffaf3', border: '1px solid #e7d8c2', borderRadius: 14, padding: '18px', margin: '20px 0' },
  title: { fontFamily: '"Noto Serif JP", "Yu Mincho", serif', fontSize: 16, fontWeight: 700, color: '#2d2318', margin: 0 },
  note: { fontSize: 13, color: '#5b4f3f', lineHeight: 1.6, margin: '6px 0 0' },
  row: { display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 },
  input: { flex: '1 1 200px', minWidth: 0, padding: '10px 12px', border: '1px solid #d8c6ad', borderRadius: 10, fontSize: 15, color: '#2d2318', background: '#fff' },
  btn: { padding: '10px 18px', border: 'none', borderRadius: 10, background: '#b8833f', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' },
};
