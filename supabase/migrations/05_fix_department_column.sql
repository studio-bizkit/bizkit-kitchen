-- First, check if the column exists
DO $$ 
BEGIN
    -- Add the column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'department'
    ) THEN
        ALTER TABLE public.profiles
        ADD COLUMN department text;
    END IF;
END $$;

-- Add the check constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_department_check'
    ) THEN
        ALTER TABLE public.profiles
        ADD CONSTRAINT profiles_department_check 
        CHECK (department IN ('designer', 'developer'));
    END IF;
END $$;

-- Set default value for any NULL values
UPDATE public.profiles
SET department = 'developer'
WHERE department IS NULL; 