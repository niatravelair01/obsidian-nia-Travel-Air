
-- Create orcamentos table
CREATE TABLE public.orcamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  titulo text,
  valor_total numeric DEFAULT 0,
  custo_total numeric DEFAULT 0,
  margem_percent numeric DEFAULT 0,
  lucro numeric DEFAULT 0,
  status text DEFAULT 'rascunho',
  motivo_perda text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orcamentos ENABLE ROW LEVEL SECURITY;

-- SELECT policy
CREATE POLICY "Users can view orcamentos from their company"
  ON public.orcamentos FOR SELECT
  USING (company_id = auth.uid());

-- INSERT policy
CREATE POLICY "Users can create orcamentos for their company"
  ON public.orcamentos FOR INSERT
  WITH CHECK (company_id = auth.uid());

-- UPDATE policy
CREATE POLICY "Users can update orcamentos from their company"
  ON public.orcamentos FOR UPDATE
  USING (company_id = auth.uid());

-- DELETE policy
CREATE POLICY "Users can delete orcamentos from their company"
  ON public.orcamentos FOR DELETE
  USING (company_id = auth.uid());

-- Trigger to recalculate lucro/margem on approval
CREATE OR REPLACE FUNCTION public.recalculate_orcamento_lucro()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.status = 'aprovado' THEN
    NEW.lucro := COALESCE(NEW.valor_total, 0) - COALESCE(NEW.custo_total, 0);
    NEW.margem_percent := CASE
      WHEN COALESCE(NEW.valor_total, 0) > 0
      THEN ROUND((NEW.lucro / NEW.valor_total) * 100, 2)
      ELSE 0
    END;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_recalculate_orcamento_lucro
  BEFORE INSERT OR UPDATE ON public.orcamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.recalculate_orcamento_lucro();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.orcamentos;
