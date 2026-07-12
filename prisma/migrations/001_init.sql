-- ─── Vizzy Chat Database Schema ──────────────────────────────
-- Run this in Supabase SQL Editor or via migration
-- ─────────────────────────────────────────────────────────────

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── Users ───────────────────────────────────────────────────

create table public.users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  name text,
  avatar_url text,
  provider text,
  provider_id text unique,
  credits integer default 1000 not null,
  plan text default 'free' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ─── Conversations ───────────────────────────────────────────

create table public.conversations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  title text default 'New conversation' not null,
  is_archived boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index idx_conversations_user_updated
  on public.conversations(user_id, updated_at desc);

-- ─── Messages ────────────────────────────────────────────────

create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  content_type text default 'text' not null,
  metadata jsonb,
  created_at timestamptz default now() not null
);

create index idx_messages_conversation
  on public.messages(conversation_id, created_at);

-- ─── Generated Assets ────────────────────────────────────────

create table public.generated_assets (
  id uuid primary key default uuid_generate_v4(),
  message_id uuid references public.messages(id) on delete cascade not null,
  asset_type text not null,
  prompt text not null,
  storage_url text,
  thumbnail_url text,
  width integer,
  height integer,
  format text,
  file_size integer,
  metadata jsonb,
  is_favorite boolean default false not null,
  created_at timestamptz default now() not null
);

create index idx_assets_message
  on public.generated_assets(message_id);

-- ─── User Preferences ────────────────────────────────────────

create table public.user_preferences (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique references public.users(id) on delete cascade not null,
  preferred_styles text[] default '{}',
  favorite_colors text[] default '{}',
  business_type text,
  brand_voice text,
  brand_colors text[] default '{}',
  brand_fonts text[] default '{}',
  target_audience text,
  updated_at timestamptz default now() not null
);

-- ─── API Keys ────────────────────────────────────────────────

create table public.api_keys (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  key_hash text unique not null,
  prefix text not null,
  last_used timestamptz,
  expires_at timestamptz,
  is_active boolean default true not null,
  created_at timestamptz default now() not null
);

create index idx_api_keys_user on public.api_keys(user_id);

-- ─── Rate Limits ─────────────────────────────────────────────

create table public.rate_limits (
  id uuid primary key default uuid_generate_v4(),
  identifier text not null,
  endpoint text not null,
  count integer default 1 not null,
  window_start timestamptz not null
);

create index idx_rate_limits_lookup
  on public.rate_limits(identifier, endpoint, window_start);

-- ─── Audit Logs ──────────────────────────────────────────────

create table public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid,
  action text not null,
  resource text not null,
  resource_id uuid,
  metadata jsonb,
  ip_address text,
  created_at timestamptz default now() not null
);

create index idx_audit_logs_user
  on public.audit_logs(user_id, created_at desc);

create index idx_audit_logs_resource
  on public.audit_logs(resource, resource_id);

-- ─── Auto-update timestamps ──────────────────────────────────

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger users_updated_at
  before update on public.users
  for each row execute function update_updated_at();

create trigger conversations_updated_at
  before update on public.conversations
  for each row execute function update_updated_at();

create trigger user_preferences_updated_at
  before update on public.user_preferences
  for each row execute function update_updated_at();

-- ─── Row Level Security ──────────────────────────────────────

alter table public.users enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.generated_assets enable row level security;
alter table public.user_preferences enable row level security;
alter table public.api_keys enable row level security;
alter table public.rate_limits enable row level security;
alter table public.audit_logs enable row level security;

-- Users can read/update their own profile
create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = provider_id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = provider_id);

-- Conversations: users own their conversations
create policy "Users can view own conversations"
  on public.conversations for select
  using (user_id in (
    select id from public.users where provider_id = auth.uid()
  ));

create policy "Users can create conversations"
  on public.conversations for insert
  with check (user_id in (
    select id from public.users where provider_id = auth.uid()
  ));

create policy "Users can update own conversations"
  on public.conversations for update
  using (user_id in (
    select id from public.users where provider_id = auth.uid()
  ));

create policy "Users can delete own conversations"
  on public.conversations for delete
  using (user_id in (
    select id from public.users where provider_id = auth.uid()
  ));

-- Messages: via conversation ownership
create policy "Users can view own messages"
  on public.messages for select
  using (conversation_id in (
    select c.id from public.conversations c
    join public.users u on c.user_id = u.id
    where u.provider_id = auth.uid()
  ));

create policy "Users can create messages"
  on public.messages for insert
  with check (conversation_id in (
    select c.id from public.conversations c
    join public.users u on c.user_id = u.id
    where u.provider_id = auth.uid()
  ));

-- Assets: via message -> conversation ownership
create policy "Users can view own assets"
  on public.generated_assets for select
  using (message_id in (
    select m.id from public.messages m
    join public.conversations c on m.conversation_id = c.id
    join public.users u on c.user_id = u.id
    where u.provider_id = auth.uid()
  ));

create policy "Users can manage own assets"
  on public.generated_assets for all
  using (message_id in (
    select m.id from public.messages m
    join public.conversations c on m.conversation_id = c.id
    join public.users u on c.user_id = u.id
    where u.provider_id = auth.uid()
  ));

-- Preferences: users own their preferences
create policy "Users can view own preferences"
  on public.user_preferences for select
  using (user_id in (
    select id from public.users where provider_id = auth.uid()
  ));

create policy "Users can upsert own preferences"
  on public.user_preferences for all
  using (user_id in (
    select id from public.users where provider_id = auth.uid()
  ));

-- Thumbnails: public read
create policy "Public can read thumbnails"
  on public.generated_assets for select
  using (thumbnail_url is not null);

-- ─── Storage Buckets ─────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('uploads', 'uploads', false, 52428800, '{"image/*","video/*","application/pdf"}'),
  ('generated-assets', 'generated-assets', false, 104857600, '{"image/*","video/*"}'),
  ('thumbnails', 'thumbnails', true, 5242880, '{"image/*"}')
on conflict (id) do nothing;

-- Storage RLS policies
create policy "Users can upload to own folder"
  on storage.objects for insert
  with check (
    bucket_id in ('uploads', 'generated-assets')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can view own uploads"
  on storage.objects for select
  using (
    bucket_id in ('uploads', 'generated-assets')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Public can view thumbnails"
  on storage.objects for select
  using (bucket_id = 'thumbnails');
