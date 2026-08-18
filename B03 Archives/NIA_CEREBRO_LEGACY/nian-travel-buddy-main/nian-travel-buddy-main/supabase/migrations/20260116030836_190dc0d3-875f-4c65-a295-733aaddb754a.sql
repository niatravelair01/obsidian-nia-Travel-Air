-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create table for NIA settings
CREATE TABLE public.nia_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  -- Agency Profile
  agency_name TEXT,
  agency_stage TEXT CHECK (agency_stage IN ('iniciante', 'crescimento', 'estruturada')),
  agency_focus TEXT CHECK (agency_focus IN ('lazer', 'corporativo', 'misto')),
  -- Communication Style
  communication_style TEXT CHECK (communication_style IN ('direto', 'explicativo', 'informal', 'estrategico')),
  -- Business Focus
  business_priority TEXT CHECK (business_priority IN ('vender_mais', 'eficiencia', 'reduzir_erros')),
  client_profile TEXT CHECK (client_profile IN ('preco', 'conforto', 'experiencia')),
  -- Limits and Preferences
  avoid_discounts BOOLEAN DEFAULT false,
  avoid_aggressive_followups BOOLEAN DEFAULT false,
  prefer_premium BOOLEAN DEFAULT false,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Ensure one settings record per user (or one global if no auth)
  CONSTRAINT unique_user_settings UNIQUE (user_id)
);

-- Enable Row Level Security
ALTER TABLE public.nia_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (since no auth is implemented yet)
CREATE POLICY "Allow public access to nia_settings" 
ON public.nia_settings 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_nia_settings_updated_at
BEFORE UPDATE ON public.nia_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();