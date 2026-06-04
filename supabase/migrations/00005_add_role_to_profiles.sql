-- ============================================================
-- THE TRACKER — Add Role Column & Role Protection Trigger
-- ============================================================

-- 1. Add role column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' NOT NULL;

-- 2. Add check constraint to ensure only valid roles are allowed
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS chk_profiles_role;
ALTER TABLE public.profiles ADD CONSTRAINT chk_profiles_role CHECK (role IN ('super_admin', 'admin', 'user'));

-- 3. Create role protection trigger function
CREATE OR REPLACE FUNCTION public.check_role_update()
RETURNS TRIGGER AS $$
DECLARE
  current_user_role TEXT;
BEGIN
  -- Get the role of the user performing the update
  SELECT role INTO current_user_role FROM public.profiles WHERE id = auth.uid();
  
  -- If the role is being changed
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- Only allow changes if the updater is a 'super_admin'
    -- Note: When creating a profile initially (trigger in auth.users), OLD is null, so this trigger does not run or NEW.role is accepted.
    IF TG_OP = 'UPDATE' THEN
      IF current_user_role IS DISTINCT FROM 'super_admin' THEN
        NEW.role = OLD.role;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Bind trigger to profiles BEFORE UPDATE
DROP TRIGGER IF EXISTS protect_profile_role ON public.profiles;
CREATE TRIGGER protect_profile_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_role_update();
