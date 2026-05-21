create table if not exists oracle_wall (
  id          uuid primary key default gen_random_uuid(),
  type_name   text not null,
  deity_name  text not null,
  message     text not null check (char_length(message) <= 120),
  category    text not null default 'mbti',
  created_at  timestamptz not null default now()
);

create index if not exists oracle_wall_category_created_at_idx
  on oracle_wall(category, created_at desc);

-- 匿名ユーザーが読み書きできる（Row Level Security は Identity で別途設定）
alter table oracle_wall enable row level security;

create policy "anyone can read oracle_wall"
  on oracle_wall for select using (true);

create policy "anyone can insert oracle_wall"
  on oracle_wall for insert with check (true);
