-- ============================================================
-- 旅行手账网站 · 数据库初始化脚本
-- 用法：在 Supabase 控制台左侧 "SQL Editor" 里新建查询，
--       把本文件全部内容粘贴进去，把下方"你的管理员邮箱"替换成你的邮箱，然后运行。
-- ============================================================

-- 1) 用户资料表（注册时自动创建；role: pending=待批准 member=已批准 admin=管理员）
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  bio text default '',
  role text not null default 'pending' check (role in ('pending', 'member', 'admin')),
  avatar_url text,
  created_at timestamptz not null default now()
);

-- 判断用户角色的安全函数（供权限策略使用）
create or replace function public.user_role(uid uuid)
returns text
language sql
security definer
set search_path = public
as $$
  select role from public.profiles where id = uid
$$;

-- 注册后自动创建资料；第一个使用管理员邮箱注册的人自动成为管理员
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_role text;
begin
  new_role := case
    when new.email = '你的管理员邮箱@example.com' then 'admin'
    else 'pending'
  end;
  insert into public.profiles (id, username, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    new_role
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2) 游记表
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  location_name text not null,
  lat double precision not null,
  lng double precision not null,
  content text not null,
  image_urls text[] not null default '{}',
  video_url text,
  status text not null default 'published' check (status in ('published', 'pending')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3) 点赞表
create table if not exists public.likes (
  user_id uuid not null references public.profiles (id) on delete cascade,
  post_id uuid not null references public.posts (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

-- 4) 评论表
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists posts_author_idx on public.posts (author_id);
create index if not exists comments_post_idx on public.comments (post_id);
create index if not exists likes_post_idx on public.likes (post_id);

-- 5) 行级安全策略
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;

-- 资料：所有人可见；本人可改；管理员可改
drop policy if exists "profiles are viewable" on public.profiles;
create policy "profiles are viewable" on public.profiles for select using (true);

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile" on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "admins can update profiles" on public.profiles;
create policy "admins can update profiles" on public.profiles for update
  using (public.user_role(auth.uid()) = 'admin');

-- 游记：已发布内容所有人可见；作者/管理员可看自己的待审内容
drop policy if exists "posts are viewable" on public.posts;
create policy "posts are viewable" on public.posts for select
  using (status = 'published' or author_id = auth.uid() or public.user_role(auth.uid()) = 'admin');

drop policy if exists "members can create posts" on public.posts;
create policy "members can create posts" on public.posts for insert
  with check (author_id = auth.uid() and public.user_role(auth.uid()) in ('admin', 'member'));

drop policy if exists "authors can update posts" on public.posts;
create policy "authors can update posts" on public.posts for update
  using (author_id = auth.uid() or public.user_role(auth.uid()) = 'admin');

drop policy if exists "authors can delete posts" on public.posts;
create policy "authors can delete posts" on public.posts for delete
  using (author_id = auth.uid() or public.user_role(auth.uid()) = 'admin');

-- 点赞：所有人可见；登录用户可点赞；本人/管理员可取消
drop policy if exists "likes are viewable" on public.likes;
create policy "likes are viewable" on public.likes for select using (true);

drop policy if exists "users can insert likes" on public.likes;
create policy "users can insert likes" on public.likes for insert
  with check (user_id = auth.uid() and public.user_role(auth.uid()) in ('admin', 'member'));

drop policy if exists "users can delete likes" on public.likes;
create policy "users can delete likes" on public.likes for delete
  using (user_id = auth.uid() or public.user_role(auth.uid()) = 'admin');

-- 评论：所有人可见；登录用户可评论；作者/管理员可删除
drop policy if exists "comments are viewable" on public.comments;
create policy "comments are viewable" on public.comments for select using (true);

drop policy if exists "users can insert comments" on public.comments;
create policy "users can insert comments" on public.comments for insert
  with check (author_id = auth.uid() and public.user_role(auth.uid()) in ('admin', 'member'));

drop policy if exists "authors can delete comments" on public.comments;
create policy "authors can delete comments" on public.comments for delete
  using (author_id = auth.uid() or public.user_role(auth.uid()) = 'admin');

-- 6) 图片存储桶（公开可看，登录用户可上传）
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

drop policy if exists "images are viewable" on storage.objects;
create policy "images are viewable" on storage.objects for select
  using (bucket_id = 'images');

drop policy if exists "members can upload images" on storage.objects;
create policy "members can upload images" on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'images'
    and public.user_role(auth.uid()) in ('admin', 'member')
  );

drop policy if exists "owners can update images" on storage.objects;
create policy "owners can update images" on storage.objects for update
  using (bucket_id = 'images' and owner = auth.uid());

drop policy if exists "owners can delete images" on storage.objects;
create policy "owners can delete images" on storage.objects for delete
  using (bucket_id = 'images' and owner = auth.uid());

-- 完成
select '初始化完成！请关闭本页面前的邮箱确认开关：Authentication → Sign In / Up → Email → Confirm email 设为关闭';
