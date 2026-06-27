-- SQL Schema Migrations for Internship Tracker
-- Execute this script in your Supabase project's SQL Editor (https://supabase.com/dashboard/project/uffxmfvvppeqgbpytfys/sql)
-- to extend the 'applications' table with additional fields.

-- 1. Create or extend the applications table
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Wishlist', 'Applied', 'Interviewing', 'Offer', 'Rejected'))
);

-- 2. Add extra columns if they do not exist
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS salary TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS job_url TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS applied_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS contact_person TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS work_type TEXT CHECK (work_type IN ('Remote', 'Hybrid', 'Onsite'));

-- 3. Add new date tracking columns
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS open_date DATE;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS deadline DATE;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS start_date DATE;

-- 4. Set up Row Level Security (RLS) if not already set
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- 5. Create policies (first drop existing to avoid conflicts)
DROP POLICY IF EXISTS "Users can perform all actions on their own applications" ON public.applications;

CREATE POLICY "Users can perform all actions on their own applications" 
ON public.applications
FOR ALL 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
