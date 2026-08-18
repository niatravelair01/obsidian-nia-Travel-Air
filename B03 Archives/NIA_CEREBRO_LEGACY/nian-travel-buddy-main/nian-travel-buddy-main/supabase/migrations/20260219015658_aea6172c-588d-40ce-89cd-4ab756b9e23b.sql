
-- 1. Add company_id column
ALTER TABLE public.nia_settings ADD COLUMN company_id uuid;

-- 2. Make NOT NULL (no rows exist now)
ALTER TABLE public.nia_settings ALTER COLUMN company_id SET NOT NULL;

-- 3. Drop old policy
DROP POLICY IF EXISTS "Allow public access to nia_settings" ON public.nia_settings;

-- 4. Create new restrictive policies
CREATE POLICY "Users can view their own nia_settings"
  ON public.nia_settings FOR SELECT
  USING (company_id = auth.uid());

CREATE POLICY "Users can create their own nia_settings"
  ON public.nia_settings FOR INSERT
  WITH CHECK (company_id = auth.uid());

CREATE POLICY "Users can update their own nia_settings"
  ON public.nia_settings FOR UPDATE
  USING (company_id = auth.uid())
  WITH CHECK (company_id = auth.uid());

CREATE POLICY "Users can delete their own nia_settings"
  ON public.nia_settings FOR DELETE
  USING (company_id = auth.uid());

-- 5. Ensure RLS enabled
ALTER TABLE public.nia_settings ENABLE ROW LEVEL SECURITY;

-- 6. Add protect_company_id trigger
CREATE TRIGGER protect_company_id_nia_settings
  BEFORE INSERT OR UPDATE ON public.nia_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_company_id();
