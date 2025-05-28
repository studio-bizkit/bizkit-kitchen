-- Add department column to profiles table
ALTER TABLE public.profiles
ADD COLUMN department text CHECK (department IN ('designer', 'developer'));

-- Set default value for existing rows
UPDATE public.profiles
SET department = 'developer'
WHERE department IS NULL; 