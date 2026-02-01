-- Create 'categories' bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('categories', 'categories', true)
on conflict (id) do nothing;

-- 2. Drop (just in case we want to reset strict category policies)
drop policy if exists "Public Access Categories" on storage.objects;
drop policy if exists "Auth Upload Categories" on storage.objects;
drop policy if exists "Auth Update Categories" on storage.objects;

-- 3. Create Unique Policies for Categories
create policy "Public Access Categories"
  on storage.objects for select
  using ( bucket_id = 'categories' );

create policy "Auth Upload Categories"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'categories' );

create policy "Auth Update Categories"
  on storage.objects for update
  to authenticated
  using ( bucket_id = 'categories' );
