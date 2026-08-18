
-- Add 'emitido' as valid status and create validation trigger
-- Using trigger instead of CHECK constraint for flexibility

CREATE OR REPLACE FUNCTION public.validate_orcamento_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.status NOT IN ('rascunho', 'enviado', 'aprovado', 'perdido', 'emitido') THEN
    RAISE EXCEPTION 'Status inválido: %. Valores permitidos: rascunho, enviado, aprovado, perdido, emitido', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_orcamento_status
  BEFORE INSERT OR UPDATE ON public.orcamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_orcamento_status();
