-- Create a function to add the department column if it doesn't exist
CREATE OR REPLACE FUNCTION add_department_column()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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

        -- Add the check constraint
        ALTER TABLE public.profiles
        ADD CONSTRAINT profiles_department_check 
        CHECK (department IN ('designer', 'developer'));

        -- Set default value for existing rows
        UPDATE public.profiles
        SET department = 'developer'
        WHERE department IS NULL;
    END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION add_department_column() TO authenticated; 