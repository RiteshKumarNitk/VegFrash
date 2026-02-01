-- Run this in your Supabase SQL Editor to create the 'profiles' storage bucket
-- and set up the necessary permissions for user avatars.

-- 1. Create the bucket
insert into storage.buckets (id, name, public)
values ('profiles', 'profiles', true)
on conflict (id) do nothing;

-- 2. Allow public access to view files (so everyone can see avatars)
create policy "Public Profiles are viewable by everyone"
  on storage.objects for select
  using ( bucket_id = 'profiles' );

-- 3. Allow authenticated users to upload their own files
create policy "Users can upload their own avatar"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'profiles' );

-- 4. Allow authenticated users to update their own files
create policy "Users can update their own avatar"
  on storage.objects for update
  to authenticated
  using ( bucket_id = 'profiles' );
