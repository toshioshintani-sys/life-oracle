// メール捕獲（リード取得）。診断直後の「自分が分かった瞬間」に、
// 自分が所有する唯一の再到達チャネル（メール）を得る。Supabase email_leads に直INSERT。
import { supabase } from './supabase.js';
import { trackEvent } from './analytics.js';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * メールアドレスを保存する。
 * @param {string} email
 * @param {'mbti'|'situation'|'attack'} flow
 * @param {object} meta 任意の付随情報（タイプ等・個人特定情報は入れない）
 * @returns {Promise<{ok:boolean,error?:string}>}
 */
export async function captureEmail(email, flow, meta = {}) {
  const e = (email || '').trim();
  if (!EMAIL_RE.test(e) || e.length > 254) {
    return { ok: false, error: 'メールアドレスの形式をご確認ください' };
  }
  try {
    const { error } = await supabase
      .from('email_leads')
      .insert({ email: e, flow: flow || null, meta });
    if (error) return { ok: false, error: '保存に失敗しました。時間をおいて再度お試しください' };
    trackEvent('lead_captured', { flow: flow || 'unknown' });
    return { ok: true };
  } catch {
    return { ok: false, error: '通信エラーが発生しました' };
  }
}
