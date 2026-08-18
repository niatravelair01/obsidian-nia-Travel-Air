
CREATE OR REPLACE FUNCTION public.recalculate_orcamento_lucro()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.lucro := COALESCE(NEW.valor_total, 0) - COALESCE(NEW.custo_total, 0);
  NEW.margem_percent := CASE
    WHEN COALESCE(NEW.valor_total, 0) > 0
    THEN ROUND((NEW.lucro / NEW.valor_total) * 100, 2)
    ELSE 0
  END;
  RETURN NEW;
END;
$$;
