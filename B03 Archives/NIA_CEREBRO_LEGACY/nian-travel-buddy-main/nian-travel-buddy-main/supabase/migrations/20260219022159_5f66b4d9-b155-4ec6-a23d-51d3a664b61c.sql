
-- Create company_settings table for manual cash/config
CREATE TABLE public.company_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  caixa_disponivel NUMERIC DEFAULT 0,
  custos_fixos_mensais NUMERIC DEFAULT 0,
  meta_faturamento NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Unique constraint so each company has one row
CREATE UNIQUE INDEX idx_company_settings_company_id ON public.company_settings (company_id);

-- Enable RLS
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own company_settings"
ON public.company_settings FOR SELECT
USING (company_id = auth.uid());

CREATE POLICY "Users can insert their own company_settings"
ON public.company_settings FOR INSERT
WITH CHECK (company_id = auth.uid());

CREATE POLICY "Users can update their own company_settings"
ON public.company_settings FOR UPDATE
USING (company_id = auth.uid());

CREATE POLICY "Users can delete their own company_settings"
ON public.company_settings FOR DELETE
USING (company_id = auth.uid());

-- Protect company_id trigger
CREATE TRIGGER protect_company_id_company_settings
BEFORE INSERT OR UPDATE ON public.company_settings
FOR EACH ROW EXECUTE FUNCTION public.protect_company_id();

-- Updated_at trigger
CREATE TRIGGER update_company_settings_updated_at
BEFORE UPDATE ON public.company_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
