-- Drop existing table and types if they exist
drop table if exists maintenance_tasks;
drop type if exists maintenance_task_status;
drop type if exists maintenance_task_priority;

-- Create types
create type maintenance_task_status as enum ('pending', 'in_progress', 'completed', 'cancelled');
create type maintenance_task_priority as enum ('low', 'medium', 'high', 'urgent');

-- Create table
create table maintenance_tasks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  status maintenance_task_status not null default 'pending',
  priority maintenance_task_priority not null default 'medium',
  room_id uuid references rooms(id) on delete set null,
  equipment_id uuid references equipment(id) on delete set null,
  assigned_to uuid references auth.users(id) on delete set null,
  due_date timestamp with time zone not null,
  tags text[] default array[]::text[],
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Add RLS policies
alter table maintenance_tasks enable row level security;

create policy "Allow authenticated users to read maintenance tasks"
  on maintenance_tasks for select
  to authenticated
  using (true);

create policy "Allow authenticated users to create maintenance tasks"
  on maintenance_tasks for insert
  to authenticated
  with check (true);

create policy "Allow authenticated users to update maintenance tasks"
  on maintenance_tasks for update
  to authenticated
  using (true);

create policy "Allow authenticated users to delete maintenance tasks"
  on maintenance_tasks for delete
  to authenticated
  using (true);

-- Create trigger for updated_at
create trigger set_updated_at
  before update on maintenance_tasks
  for each row
  execute function set_updated_at(); 