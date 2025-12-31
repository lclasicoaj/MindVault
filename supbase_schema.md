# Database Schema Update

Since you are enabling Multi-User support (Login) and Performance improvements, please run this **entire** block in your Supabase SQL Editor.

This script does the following:
1. Adds `user_id` to tables to track who owns what.
2. Creates Indexes on foreign keys to make retrieval fast even with 10k+ rows.
3. Sets up strict Row Level Security (RLS) so users can ONLY see their own data.
4. **NEW:** Creates a `profiles` table so you can see users in the Table Editor.

```sql
-- 1. Add user_id column to existing tables
-- We default it to auth.uid() so future inserts work automatically.
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users;

-- 2. Create Indexes for Performance (Crucial for Speed)
CREATE INDEX IF NOT EXISTS idx_blogs_user_id ON public.blogs(user_id);
CREATE INDEX IF NOT EXISTS idx_recaps_blog_id ON public.recaps(blog_id);

-- 3. Update Row Level Security (RLS) Policies
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recaps ENABLE ROW LEVEL SECURITY;

-- DROP existing policies to prevent conflicts
DROP POLICY IF EXISTS "Allow all access" ON public.blogs;
DROP POLICY IF EXISTS "Allow all access" ON public.recaps;
DROP POLICY IF EXISTS "Users can view own blogs" ON public.blogs;
DROP POLICY IF EXISTS "Users can insert own blogs" ON public.blogs;
DROP POLICY IF EXISTS "Users can view own recaps" ON public.recaps;
DROP POLICY IF EXISTS "Users can insert own recaps" ON public.recaps;

-- Policies for BLOGS
CREATE POLICY "Users can view own blogs" ON public.blogs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own blogs" ON public.blogs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for RECAPS
CREATE POLICY "Users can view own recaps" ON public.recaps FOR SELECT 
USING (exists (select 1 from public.blogs where blogs.id = recaps.blog_id and blogs.user_id = auth.uid()));

CREATE POLICY "Users can insert own recaps" ON public.recaps FOR INSERT 
WITH CHECK (exists (select 1 from public.blogs where blogs.id = recaps.blog_id and blogs.user_id = auth.uid()));

-- 4. Create Public Profiles Table (To see users in Table Editor)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

-- 5. Auto-create Profile on Signup (Trigger)
-- This ensures when a user signs up via Auth, a row is created in public.profiles automatically.
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```
