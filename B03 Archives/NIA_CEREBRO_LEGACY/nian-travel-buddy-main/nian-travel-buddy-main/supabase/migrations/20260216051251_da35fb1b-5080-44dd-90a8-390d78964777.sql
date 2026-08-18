
-- Audit log table
CREATE TABLE public.orcamento_status_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  orcamento_id uuid REFERENCES public.orcamentos(id) ON DELETE CASCADE,
  status_anterior text,
  status_novo text,
  changed_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.orcamento_status_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own status logs"
  ON public.orcamento_status_logs FOR SELECT
  USING (company_id = auth.uid());

CREATE POLICY "Users can insert their own status logs"
  ON public.orcamento_status_logs FOR INSERT
  WITH CHECK (company_id = auth.uid());

-- Trigger function
CREATE OR REPLACE FUNCTION public.log_orcamento_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.orcamento_status_logs (company_id, orcamento_id, status_anterior, status_novo)
    VALUES (NEW.company_id, NEW.id, OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger
CREATE TRIGGER trg_log_orcamento_status_change
  AFTER UPDATE ON public.orcamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.log_orcamento_status_change();
