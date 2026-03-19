-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  created_at timestamptz default now()
);

-- Set up Row Level Security (RLS) for profiles
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Create a table for drug analyses history
create table analyses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  drug_name text not null,
  smiles text,
  input_data jsonb not null,
  result_data jsonb not null,
  created_at timestamptz default now()
);

-- Set up Row Level Security (RLS) for analyses
alter table analyses enable row level security;

create policy "Users can view their own analyses." on analyses
  for select using (auth.uid() = user_id);

create policy "Users can insert their own analyses." on analyses
  for insert with check (auth.uid() = user_id);

-- Trigger to create a profile after signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
