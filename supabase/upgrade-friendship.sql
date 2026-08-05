-- ============================================================
-- 友达手账 · 新功能：日常打卡 + 留言板
-- 用法：在 Supabase 的 SQL Editor 里粘贴并运行即可，可重复运行
-- ============================================================

-- 1) 日常打卡：每人每天一条
create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  date date not null default current_date,
  note text not null default '',
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

alter table public.checkins enable row level security;

drop policy if exists "checkins are viewable" on public.checkins;
create policy "checkins are viewable" on public.checkins for select using (true);

drop policy if exists "members can check in" on public.checkins;
create policy "members can check in" on public.checkins for insert
  with check (user_id = auth.uid() and public.user_role(auth.uid()) in ('admin', 'member'));

drop policy if exists "users can update own checkin" on public.checkins;
create policy "users can update own checkin" on public.checkins for update
  using (user_id = auth.uid());

drop policy if exists "users can delete own checkin" on public.checkins;
create policy "users can delete own checkin" on public.checkins for delete
  using (user_id = auth.uid());

-- 2) 留言板
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

drop policy if exists "messages are viewable" on public.messages;
create policy "messages are viewable" on public.messages for select using (true);

drop policy if exists "members can post messages" on public.messages;
create policy "members can post messages" on public.messages for insert
  with check (author_id = auth.uid() and public.user_role(auth.uid()) in ('admin', 'member'));

create index if not exists checkins_date_idx on public.checkins (date desc);
create index if not exists messages_created_idx on public.messages (created_at desc);

select '友达手账新功能已开启：日常打卡 + 留言板';
