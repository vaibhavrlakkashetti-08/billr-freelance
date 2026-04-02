-- Run this in your Supabase SQL Editor

CREATE TABLE public.logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  level text NOT NULL,
  message text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  method text,
  url text,
  status integer,
  response_time integer,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  meta jsonb
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

-- Allow insert policy for service role (backend inserting logs)
CREATE POLICY "Allow server to insert logs" ON public.logs
FOR INSERT WITH CHECK (true);

-- Allow reading logs only if admin (you can customize this RLS policy or just use the backend endpoint to bypass RLS with service_role key)
CREATE POLICY "Allow reading logs" ON public.logs
FOR SELECT USING (false); -- Set to false initially, let the backend endpoint fetch logs using its secure token.

