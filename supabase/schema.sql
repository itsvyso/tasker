-- ==============================================================================
-- TASKER PRO - SUPABASE SCHEMA & MULTI-TENANCY CONFIGURATION
-- ==============================================================================
-- High-performance schema supporting multi-workspace teams, real-time sync,
-- optimistic offline caching, and Row Level Security (RLS).
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. WORKSPACES
create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  owner_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. WORKSPACE MEMBERS
create table if not exists public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz default now(),
  unique (workspace_id, user_id)
);

-- Index workspace lookups
create index if not exists idx_workspace_members_user on public.workspace_members(user_id);
create index if not exists idx_workspace_members_ws on public.workspace_members(workspace_id);

-- Helper function: Check if current user is member of a workspace
create or replace function public.is_workspace_member(lookup_ws_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = lookup_ws_id
      and user_id = auth.uid()
  );
$$;

-- 3. PROJECTS
create table if not exists public.projects (
  id text primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  name text not null,
  code text not null,
  description text default '',
  color text default '#8B5CF6',
  icon text default 'Folder',
  member_ids jsonb default '[]'::jsonb,
  category text default 'Development',
  budget text,
  target_date text default '',
  created_at timestamptz default now()
);

create index if not exists idx_projects_workspace on public.projects(workspace_id);

-- 4. TASKS
create table if not exists public.tasks (
  id text primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  project_id text references public.projects(id) on delete cascade,
  task_code text not null,
  title text not null,
  description text default '',
  status text not null default 'backlog' check (status in ('backlog', 'in_progress', 'in_review', 'done')),
  priority text not null default 'medium' check (priority in ('urgent', 'high', 'medium', 'low')),
  assignee_id text default '',
  creator_id text default '',
  tags jsonb default '[]'::jsonb,
  subtasks jsonb default '[]'::jsonb,
  comments jsonb default '[]'::jsonb,
  attachments jsonb default '[]'::jsonb,
  due_date text not null,
  start_date text,
  estimated_hours numeric default 0,
  logged_hours numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_tasks_project on public.tasks(project_id);
create index if not exists idx_tasks_workspace on public.tasks(workspace_id);
create index if not exists idx_tasks_status on public.tasks(status);

-- 5. SUBTASKS (Detailed relational mapping option)
create table if not exists public.subtasks (
  id text primary key,
  task_id text references public.tasks(id) on delete cascade,
  title text not null,
  completed boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_subtasks_task on public.subtasks(task_id);

-- 6. ROUTINES
create table if not exists public.routines (
  id text primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  category text default 'Focus',
  target_duration_minutes integer default 25,
  streak integer default 0,
  completed_today boolean default false,
  history jsonb default '[false,false,false,false,false,false,false]'::jsonb,
  color text default '#8B5CF6',
  created_at timestamptz default now()
);

create index if not exists idx_routines_workspace on public.routines(workspace_id);
create index if not exists idx_routines_user on public.routines(user_id);

-- 7. CHAT MESSAGES
create table if not exists public.chat_messages (
  id text primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  project_id text references public.projects(id) on delete cascade,
  sender_id text not null,
  content text not null,
  attachments jsonb default '[]'::jsonb,
  timestamp text not null default '',
  created_at timestamptz default now()
);

create index if not exists idx_chat_project on public.chat_messages(project_id);
create index if not exists idx_chat_workspace on public.chat_messages(workspace_id);
create index if not exists idx_chat_created on public.chat_messages(created_at);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.subtasks enable row level security;
alter table public.routines enable row level security;
alter table public.chat_messages enable row level security;

-- Workspace Policies
create policy "Users can view workspaces they belong to"
  on public.workspaces for select
  using (owner_id = auth.uid() or public.is_workspace_member(id));

create policy "Users can create their own workspaces"
  on public.workspaces for insert
  with check (owner_id = auth.uid());

create policy "Workspace owners can update their workspace"
  on public.workspaces for update
  using (owner_id = auth.uid());

-- Workspace Member Policies
create policy "Members can view other members in same workspace"
  on public.workspace_members for select
  using (public.is_workspace_member(workspace_id));

create policy "Workspace owners can manage members"
  on public.workspace_members for all
  using (
    exists (
      select 1 from public.workspaces
      where id = workspace_members.workspace_id and owner_id = auth.uid()
    )
  );

-- Project Policies
create policy "Workspace members can view projects"
  on public.projects for select
  using (workspace_id is null or public.is_workspace_member(workspace_id));

create policy "Workspace members can insert projects"
  on public.projects for insert
  with check (workspace_id is null or public.is_workspace_member(workspace_id));

create policy "Workspace members can update projects"
  on public.projects for update
  using (workspace_id is null or public.is_workspace_member(workspace_id));

create policy "Workspace members can delete projects"
  on public.projects for delete
  using (workspace_id is null or public.is_workspace_member(workspace_id));

-- Task Policies
create policy "Workspace members can view tasks"
  on public.tasks for select
  using (workspace_id is null or public.is_workspace_member(workspace_id));

create policy "Workspace members can insert tasks"
  on public.tasks for insert
  with check (workspace_id is null or public.is_workspace_member(workspace_id));

create policy "Workspace members can update tasks"
  on public.tasks for update
  using (workspace_id is null or public.is_workspace_member(workspace_id));

create policy "Workspace members can delete tasks"
  on public.tasks for delete
  using (workspace_id is null or public.is_workspace_member(workspace_id));

-- Subtask Policies
create policy "Workspace members can manage subtasks"
  on public.subtasks for all
  using (
    exists (
      select 1 from public.tasks
      where tasks.id = subtasks.task_id
        and (tasks.workspace_id is null or public.is_workspace_member(tasks.workspace_id))
    )
  );

-- Routine Policies
create policy "Users can manage routines"
  on public.routines for all
  using (auth.uid() = user_id or workspace_id is null or public.is_workspace_member(workspace_id));

-- Chat Message Policies
create policy "Workspace members can read chat"
  on public.chat_messages for select
  using (workspace_id is null or public.is_workspace_member(workspace_id));

create policy "Workspace members can send chat"
  on public.chat_messages for insert
  with check (workspace_id is null or public.is_workspace_member(workspace_id));

create policy "Workspace members can delete chat"
  on public.chat_messages for delete
  using (workspace_id is null or public.is_workspace_member(workspace_id));

-- ==============================================================================
-- REALTIME SUBSCRIPTIONS CONFIGURATION
-- ==============================================================================

-- Enable full row replication for update events
alter table public.projects replica identity full;
alter table public.tasks replica identity full;
alter table public.subtasks replica identity full;
alter table public.routines replica identity full;
alter table public.chat_messages replica identity full;

-- Add tables to supabase_realtime publication
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.projects;
    alter publication supabase_realtime add table public.tasks;
    alter publication supabase_realtime add table public.subtasks;
    alter publication supabase_realtime add table public.routines;
    alter publication supabase_realtime add table public.chat_messages;
  end if;
end;
$$;
