-- Drop existing policies if they exist
drop policy if exists "Users can view their own profile" on user_profiles;
drop policy if exists "Admins can view all profiles" on user_profiles;
drop policy if exists "Admins can insert profiles" on user_profiles;
drop policy if exists "Admins can update profiles" on user_profiles;
drop policy if exists "Users can update their own profile" on user_profiles;
drop policy if exists "Admins can delete profiles" on user_profiles;

-- Enable RLS on user_profiles table
alter table user_profiles enable row level security;

-- Allow users to view their own profile
create policy "Users can view their own profile"
on user_profiles for select
using (auth.uid() = id);

-- Allow admins to view all profiles
create policy "Admins can view all profiles"
on user_profiles for select
using (auth.jwt() ->> 'role' = 'admin');

-- Allow admins to insert profiles
create policy "Admins can insert profiles"
on user_profiles for insert
with check (auth.jwt() ->> 'role' = 'admin');

-- Allow admins to update profiles
create policy "Admins can update profiles"
on user_profiles for update
using (auth.jwt() ->> 'role' = 'admin');

-- Allow users to update their own profile
create policy "Users can update their own profile"
on user_profiles for update
using (auth.uid() = id);

-- Allow admins to delete profiles
create policy "Admins can delete profiles"
on user_profiles for delete
using (auth.jwt() ->> 'role' = 'admin');
