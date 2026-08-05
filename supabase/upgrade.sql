-- ============================================================
-- 增量更新（2026-08-05）：日记功能升级
-- 用法：在 Supabase 的 SQL Editor 里粘贴并运行即可，可重复运行
-- ============================================================

alter table public.posts
  add column if not exists tags text[] not null default '{}';

alter table public.posts
  add column if not exists occurred_at date;

alter table public.posts
  alter column lat drop not null;

alter table public.posts
  alter column lng drop not null;

update public.posts
  set occurred_at = created_at::date
  where occurred_at is null;

select '日记功能升级完成！';
