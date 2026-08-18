
-- 1️⃣ BLOQUEIO DE STATUS SEM CUSTO
CREATE OR REPLACE FUNCTION public.validate_orcamento_custo_obrigatorio()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.status IN ('aprovado', 'emitido') AND (NEW.custo_total IS NULL OR NEW.custo_total = 0) THEN
    RAISE EXCEPTION 'Custo total obrigatório antes de aprovar ou emitir.';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_custo_obrigatorio
  BEFORE INSERT OR UPDATE ON public.orcamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_orcamento_custo_obrigatorio();

-- 2️⃣ CHECKLIST PRÉ-EMISSÃO
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS confirmacao_cliente boolean DEFAULT false;
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS checklist_conferido boolean DEFAULT false;
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS pagamento_confirmado boolean DEFAULT false;

CREATE OR REPLACE FUNCTION public.validate_checklist_pre_emissao()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.status = 'emitido' AND (
    NEW.confirmacao_cliente IS NOT TRUE OR
    NEW.checklist_conferido IS NOT TRUE OR
    NEW.pagamento_confirmado IS NOT TRUE
  ) THEN
    RAISE EXCEPTION 'Checklist pré-emissão incompleto.';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_checklist_pre_emissao
  BEFORE UPDATE ON public.orcamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_checklist_pre_emissao();

-- 3️⃣ MOTIVO OBRIGATÓRIO PARA PERDA
CREATE OR REPLACE FUNCTION public.validate_motivo_perda_obrigatorio()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.status = 'perdido' AND (NEW.motivo_perda IS NULL OR TRIM(NEW.motivo_perda) = '') THEN
    RAISE EXCEPTION 'Motivo da perda obrigatório.';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_motivo_perda
  BEFORE INSERT OR UPDATE ON public.orcamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_motivo_perda_obrigatorio();

-- 4️⃣ CASCADE - verificar e corrigir FKs
-- orcamentos.client_id
ALTER TABLE public.orcamentos DROP CONSTRAINT IF EXISTS orcamentos_client_id_fkey;
ALTER TABLE public.orcamentos ADD CONSTRAINT orcamentos_client_id_fkey
  FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;

-- tasks.client_id
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_client_id_fkey;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_client_id_fkey
  FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;

-- followups.client_id
ALTER TABLE public.followups DROP CONSTRAINT IF EXISTS followups_client_id_fkey;
ALTER TABLE public.followups ADD CONSTRAINT followups_client_id_fkey
  FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;

-- follow_ups.client_id
ALTER TABLE public.follow_ups DROP CONSTRAINT IF EXISTS follow_ups_client_id_fkey;
ALTER TABLE public.follow_ups ADD CONSTRAINT follow_ups_client_id_fkey
  FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;

-- 5️⃣ FORMA DE PAGAMENTO
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS forma_pagamento text;

CREATE OR REPLACE FUNCTION public.validate_forma_pagamento()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.forma_pagamento IS NOT NULL AND NEW.forma_pagamento NOT IN ('pix', 'cartao_1x', 'cartao_parcelado', 'boleto') THEN
    RAISE EXCEPTION 'Forma de pagamento inválida: %. Valores permitidos: pix, cartao_1x, cartao_parcelado, boleto', NEW.forma_pagamento;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_forma_pagamento
  BEFORE INSERT OR UPDATE ON public.orcamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_forma_pagamento();

-- 6️⃣ PROTEGER COMPANY_ID
CREATE OR REPLACE FUNCTION public.protect_company_id()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  -- No INSERT, forçar company_id = auth.uid()
  IF TG_OP = 'INSERT' THEN
    NEW.company_id := auth.uid();
  END IF;
  -- No UPDATE, impedir alteração
  IF TG_OP = 'UPDATE' AND NEW.company_id IS DISTINCT FROM OLD.company_id THEN
    RAISE EXCEPTION 'Não é permitido alterar o company_id.';
  END IF;
  RETURN NEW;
END;
$$;

-- Aplicar em todas as tabelas com company_id
CREATE TRIGGER trg_protect_company_id_orcamentos
  BEFORE INSERT OR UPDATE ON public.orcamentos
  FOR EACH ROW EXECUTE FUNCTION public.protect_company_id();

CREATE TRIGGER trg_protect_company_id_clients
  BEFORE INSERT OR UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.protect_company_id();

CREATE TRIGGER trg_protect_company_id_tasks
  BEFORE INSERT OR UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.protect_company_id();

CREATE TRIGGER trg_protect_company_id_followups
  BEFORE INSERT OR UPDATE ON public.followups
  FOR EACH ROW EXECUTE FUNCTION public.protect_company_id();

CREATE TRIGGER trg_protect_company_id_follow_ups
  BEFORE INSERT OR UPDATE ON public.follow_ups
  FOR EACH ROW EXECUTE FUNCTION public.protect_company_id();
