-- Esquema de referencia inicial MiMuR para Supabase/PostgreSQL.
-- Revisar antes de ejecutar. RLS está activado y las políticas son deliberadamente restrictivas.
create extension if not exists pgcrypto;
create type public.app_role as enum ('customer','musician','admin');
create type public.availability_status as enum ('available','emergency_only','busy');
create type public.request_status as enum ('open','matching','offers_received','booked','cancelled','completed');
create type public.offer_status as enum ('pending','accepted','declined','withdrawn');
create table public.profiles(id uuid primary key references auth.users(id) on delete cascade,role public.app_role not null default 'customer',display_name text not null,phone text,city text,created_at timestamptz not null default now());
create table public.musicians(id uuid primary key default gen_random_uuid(),user_id uuid not null unique references public.profiles(id) on delete cascade,artist_name text not null,genres text[] not null default '{}',zone text not null,service_radius_km int not null default 20 check(service_radius_km between 1 and 500),minimum_price_mxn int check(minimum_price_mxn>=0),video_url text,social_url text,bio text,availability public.availability_status not null default 'available',emergency_opt_in boolean not null default false,approved boolean not null default false,created_at timestamptz not null default now());
create table public.event_requests(id uuid primary key default gen_random_uuid(),customer_id uuid not null references public.profiles(id),event_type text not null,event_date timestamptz not null,zone text not null,genre text not null,duration_minutes int check(duration_minutes>0),budget_mxn int not null check(budget_mxn>0),details text,status public.request_status not null default 'open',created_at timestamptz not null default now());
create table public.offers(id uuid primary key default gen_random_uuid(),event_request_id uuid not null references public.event_requests(id) on delete cascade,musician_id uuid not null references public.musicians(id) on delete cascade,gross_budget_mxn int not null check(gross_budget_mxn>0),commission_bps int not null default 1000 check(commission_bps between 0 and 10000),net_offer_mxn int generated always as (gross_budget_mxn-((gross_budget_mxn*commission_bps)/10000)) stored,status public.offer_status not null default 'pending',musician_note text,created_at timestamptz not null default now(),unique(event_request_id,musician_id));
create table public.bookings(id uuid primary key default gen_random_uuid(),event_request_id uuid not null unique references public.event_requests(id),accepted_offer_id uuid not null unique references public.offers(id),agreed_total_mxn int not null check(agreed_total_mxn>0),commission_mxn int not null check(commission_mxn>=0),musician_payout_mxn int not null check(musician_payout_mxn>=0),status text not null default 'pending_confirmation' check(status in ('pending_confirmation','confirmed','cancelled','completed','disputed')),created_at timestamptz not null default now());
alter table public.profiles enable row level security;alter table public.musicians enable row level security;alter table public.event_requests enable row level security;alter table public.offers enable row level security;alter table public.bookings enable row level security;
create policy "Users read own profile" on public.profiles for select to authenticated using(auth.uid()=id);
create policy "Users insert own profile" on public.profiles for insert to authenticated with check(auth.uid()=id and role='customer');
create policy "Users update own profile"
ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id AND role <> 'admin');
create policy "Musicians read own row"
on public.musicians for select to authenticated
using (user_id = auth.uid());

create policy "Musicians insert own row"
on public.musicians for insert to authenticated
with check (user_id = auth.uid() and approved = false);

create policy "Musicians update own row"
on public.musicians for update to authenticated
using (user_id = auth.uid() and approved = false)
with check (user_id = auth.uid() and approved = false);
-- No publicar con datos reales hasta añadir y probar políticas para catálogo público,
-- solicitudes, ofertas, reservas y administradores. No se incluyen pagos ni secretos.
