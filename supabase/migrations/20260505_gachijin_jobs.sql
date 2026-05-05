create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  series text not null,
  theme text not null,
  start_date date not null,
  post_time text not null,
  mode text not null,
  style_preset text not null,
  status text not null default 'queued',
  retry_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_error text,
  constraint jobs_series_check check (series in ('gachijin')),
  constraint jobs_mode_check check (mode in ('draft_only', 'schedule_publish')),
  constraint jobs_style_preset_check check (style_preset in ('gachijin_default'))
);

create table if not exists job_outputs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  day_no int not null check (day_no between 1 and 3),
  article_path text,
  raw_thumb_path text,
  final_thumb_path text,
  note_payload_path text,
  note_url text,
  scheduled_at timestamptz,
  status text not null default 'queued',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(job_id, day_no)
);

create table if not exists job_logs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  stage text not null,
  message text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists jobs_series_created_at_idx on jobs(series, created_at desc);
create index if not exists job_outputs_job_id_idx on job_outputs(job_id);
create index if not exists job_logs_job_id_created_at_idx on job_logs(job_id, created_at desc);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists jobs_set_updated_at on jobs;
create trigger jobs_set_updated_at
before update on jobs
for each row execute function set_updated_at();

drop trigger if exists job_outputs_set_updated_at on job_outputs;
create trigger job_outputs_set_updated_at
before update on job_outputs
for each row execute function set_updated_at();
