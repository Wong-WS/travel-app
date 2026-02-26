-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  full_name text,
  avatar_url text,
  bio text,
  country_count integer default 0,
  city_count integer default 0,
  created_at timestamptz default now()
);

-- Visits table
create table public.visits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  country_code char(2) not null,
  country_name text not null,
  city text,
  lat numeric,
  lng numeric,
  visited_at date not null,
  notes text,
  created_at timestamptz default now()
);

-- Photos table
create table public.photos (
  id uuid default uuid_generate_v4() primary key,
  visit_id uuid references public.visits(id) on delete cascade not null,
  url text not null,
  caption text,
  created_at timestamptz default now()
);

-- Follows table
create table public.follows (
  follower_id uuid references public.profiles(id) on delete cascade,
  following_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, following_id)
);

-- Auto-update country/city counts trigger
create or replace function update_visit_counts()
returns trigger as $$
begin
  update profiles set
    country_count = (
      select count(distinct country_code) from visits where user_id = coalesce(new.user_id, old.user_id)
    ),
    city_count = (
      select count(*) from visits where user_id = coalesce(new.user_id, old.user_id) and city is not null
    )
  where id = coalesce(new.user_id, old.user_id);
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

create trigger on_visit_change
  after insert or update or delete on visits
  for each row execute function update_visit_counts();

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.visits enable row level security;
alter table public.photos enable row level security;
alter table public.follows enable row level security;

-- Profiles: public read, own write
create policy "Profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Visits: public read, own write
create policy "Visits are viewable by everyone" on visits for select using (true);
create policy "Users can manage own visits" on visits for all using (auth.uid() = user_id);

-- Photos: public read, own write (via visit ownership)
create policy "Photos are viewable by everyone" on photos for select using (true);
create policy "Users can manage own photos" on photos for all using (
  auth.uid() = (select user_id from visits where id = visit_id)
);

-- Follows: public read, own write
create policy "Follows are viewable by everyone" on follows for select using (true);
create policy "Users can manage own follows" on follows for all using (auth.uid() = follower_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
