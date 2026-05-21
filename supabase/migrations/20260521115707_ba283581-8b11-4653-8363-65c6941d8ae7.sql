
-- Roles
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "Admins can view all roles"
on public.user_roles for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Users can view their own roles"
on public.user_roles for select to authenticated
using (auth.uid() = user_id);

-- First-signup bootstrap: first user becomes admin
create or replace function public.bootstrap_first_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  else
    insert into public.user_roles (user_id, role) values (new.id, 'user')
    on conflict do nothing;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created_bootstrap_role
after insert on auth.users
for each row execute function public.bootstrap_first_admin();

-- Give click log
create table public.give_clicks (
  id uuid primary key default gen_random_uuid(),
  event_name text not null default 'give_click',
  ngo_id text,
  country_code text,
  country_name text,
  destination_url text,
  is_national boolean,
  page_path text,
  referrer text,
  language text,
  user_agent text,
  session_id text,
  variant text,
  created_at timestamptz not null default now()
);

create index give_clicks_created_at_idx on public.give_clicks (created_at desc);
create index give_clicks_country_idx on public.give_clicks (country_code);
create index give_clicks_ngo_idx on public.give_clicks (ngo_id);

alter table public.give_clicks enable row level security;

create policy "Anyone can log a give click"
on public.give_clicks for insert to anon, authenticated
with check (true);

create policy "Admins can view give clicks"
on public.give_clicks for select to authenticated
using (public.has_role(auth.uid(), 'admin'));
