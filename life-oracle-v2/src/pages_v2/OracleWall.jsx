// オラクルの壁 — 神様名で投稿できる匿名掲示板
// タイプ名 + 世界の神様の名前 + 日付 で投稿者を表示

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';
import { getDeityName } from '../lib/deityNames.js';

const MAX_CHARS = 120;
const PAGE_SIZE = 20;

function formatDate(iso) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

async function getClientIp() {
  try {
    const r = await fetch('https://api.ipify.org?format=json');
    const j = await r.json();
    return j.ip ?? '';
  } catch {
    return Math.random().toString(36).slice(2);
  }
}

export function OracleWall({ typeName, category = 'mbti' }) {
  const [posts, setPosts]         = useState([]);
  const [text, setText]           = useState('');
  const [sending, setSending]     = useState(false);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [deityName, setDeityName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const displayName = typeName ? `${typeName} × ${deityName}` : deityName;

  useEffect(() => {
    getClientIp().then(ip => setDeityName(getDeityName(ip)));
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('oracle_wall')
      .select('id, type_name, deity_name, message, created_at')
      .eq('category', category)
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE);

    if (err) {
      setError('投稿を読み込めませんでした');
    } else {
      setPosts(data ?? []);
    }
    setLoading(false);
  }, [category]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;

    setSending(true);
    setError(null);

    const ip = await getClientIp();
    const deity = getDeityName(ip);

    const { error: err } = await supabase.from('oracle_wall').insert({
      type_name:  typeName ?? '不明',
      deity_name: deity,
      message:    text.trim().slice(0, MAX_CHARS),
      category,
    });

    if (err) {
      setError('投稿に失敗しました。しばらく経ってから試してください。');
    } else {
      setText('');
      setSubmitted(true);
      fetchPosts();
    }
    setSending(false);
  };

  return (
    <div className="oracle-wall">
      <div className="oracle-wall-header">
        <p className="oracle-wall-title">オラクルの壁</p>
        <p className="oracle-wall-subtitle">
          同じ景色を見た人たちの、ひとこと。
        </p>
      </div>

      {!submitted ? (
        <form className="oracle-wall-form" onSubmit={handleSubmit}>
          <p className="oracle-wall-poster">
            {displayName || '…'} として投稿
          </p>
          <textarea
            className="oracle-wall-textarea"
            value={text}
            onChange={e => setText(e.target.value.slice(0, MAX_CHARS))}
            placeholder="診断を受けて、ひとこと（120字まで）"
            rows={3}
            disabled={sending}
          />
          <div className="oracle-wall-form-footer">
            <span className="oracle-wall-count">{text.length}/{MAX_CHARS}</span>
            <button
              type="submit"
              className="oracle-wall-submit"
              disabled={!text.trim() || sending}
            >
              {sending ? '送信中…' : '投稿する'}
            </button>
          </div>
          {error && <p className="oracle-wall-error">{error}</p>}
        </form>
      ) : (
        <div className="oracle-wall-thanks">
          <p>投稿しました。ありがとう。</p>
        </div>
      )}

      <div className="oracle-wall-posts">
        {loading && <p className="oracle-wall-loading">読み込み中…</p>}
        {!loading && posts.length === 0 && (
          <p className="oracle-wall-empty">まだ投稿がありません。最初の一言を残してみてください。</p>
        )}
        {posts.map(p => (
          <div key={p.id} className="oracle-wall-post">
            <div className="oracle-wall-post-header">
              <span className="oracle-wall-post-name">
                {p.type_name} × {p.deity_name}
              </span>
              <span className="oracle-wall-post-date">
                {formatDate(p.created_at)}
              </span>
            </div>
            <p className="oracle-wall-post-message">{p.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
