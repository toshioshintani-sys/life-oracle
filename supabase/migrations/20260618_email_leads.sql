-- メール捕獲（リード取得）テーブル。診断結果末尾のフォームから anon が直INSERTする。
-- anon は挿入のみ可・SELECT不可（メールは非公開）。email形式はチェック制約で検証。
-- ※本マイグレーションは Supabase MCP で本番(frexpdazuhbxecgpnbyb)に適用済み(2026-06-18)。このファイルは記録用。
create table if not exists public.email_leads (
  id bigserial primary key,
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 254),
  flow text check (flow in ('mbti','situation','attack') or flow is null),
  meta jsonb not null default '{}'::jsonb,
  consent boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.email_leads enable row level security;
drop policy if exists "anon_insert_leads" on public.email_leads;
create policy "anon_insert_leads" on public.email_leads for insert to anon with check (true);
