
CREATE OR REPLACE FUNCTION public.validate_orcamento_integridade()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.valor_total < 0 THEN
    RAISE EXCEPTION 'Valor total não pode ser negativo';
  END IF;
  IF NEW.custo_total < 0 THEN
    RAISE EXCEPTION 'Custo total não pode ser negativo';
  END IF;
  IF NEW.custo_total > NEW.valor_total THEN
    RAISE EXCEPTION 'Custo não pode ser maior que valor total';
  END IF;
  IF NEW.margem_percent < -100 THEN
    RAISE EXCEPTION 'Margem inválida';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_orcamento_integridade
  BEFORE INSERT OR UPDATE ON public.orcamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_orcamento_integridade();
