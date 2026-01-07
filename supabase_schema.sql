-- Create a table for storing job offer analyses
create table job_offers (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  input jsonb not null,
  result jsonb not null,
  verdict text,
  money_delta numeric,
  final_score numeric,
  ip_hash text,
  user_agent text
);

-- Optional: Enable Row Level Security (RLS)
alter table job_offers enable row level security;

-- Policy to allow inserts from service role (always allowed)
-- or public anon if you want client-side inserts (but we use server-side here).
-- Since we use `SUPABASE_SERVICE_KEY` in API route, we bypass RLS.
-- But if using ANON KEY in API route, we need:
create policy "Anon can insert job offers"
on job_offers for insert
with check (true);
