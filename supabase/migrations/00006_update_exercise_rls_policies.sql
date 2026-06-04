-- ============================================================
-- THE TRACKER — Update Exercise RLS Policies for Admin Access
-- ============================================================

-- 1. Allow admins to insert system exercises (where user_id IS NULL)
DROP POLICY IF EXISTS "Admins can create system exercises" ON public.exercises;
CREATE POLICY "Admins can create system exercises"
    ON public.exercises FOR INSERT
    WITH CHECK (user_id IS NULL AND EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    ));

-- 2. Allow admins to update system exercises
DROP POLICY IF EXISTS "Admins can update system exercises" ON public.exercises;
CREATE POLICY "Admins can update system exercises"
    ON public.exercises FOR UPDATE
    USING (user_id IS NULL AND EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    ));

-- 3. Allow admins to delete system exercises
DROP POLICY IF EXISTS "Admins can delete system exercises" ON public.exercises;
CREATE POLICY "Admins can delete system exercises"
    ON public.exercises FOR DELETE
    USING (user_id IS NULL AND EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    ));
