-- 診断完了の累計カウンター（ソーシャルプルーフ用）
create table if not exists diagnosis_stats (
  flow       text primary key,
  count      bigint not null default 0,
  updated_at timestamptz not null default now()
);

insert into diagnosis_stats (flow, count) values
  ('mbti', 0),
  ('situation', 0),
  ('attack', 0),
  ('total', 0)
on conflict (flow) do nothing;

alter table diagnosis_stats enable row level security;

create policy "anyone can read diagnosis_stats"
  on diagnosis_stats for select using (true);

-- 原子的に増分するRPC（race condition回避）
create or replace function increment_diagnosis_stat(p_flow text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count bigint;
begin
  update diagnosis_stats
  set count = count + 1, updated_at = now()
  where flow = p_flow
  returning count into new_count;

  update diagnosis_stats
  set count = count + 1, updated_at = now()
  where flow = 'total';

  return new_count;
end;
$$;

grant execute on function increment_diagnosis_stat(text) to anon, authenticated;
