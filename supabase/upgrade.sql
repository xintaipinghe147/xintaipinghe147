-- ============================================================
-- 增量更新（2026-08-05）：给游记增加"标签"字段
-- 用法：在 Supabase 的 SQL Editor 里粘贴并运行即可，可重复运行
-- ============================================================

alter table public.posts
  add column if not exists tags text[] not null default '{}';

select '标签字段已添加！';
