-- Create client status enum
CREATE TYPE public.client_status AS ENUM ('atendimento', 'negociacao', 'pos-venda', 'lead', 'inativo');

-- Create price sensitivity enum
CREATE TYPE public.price_sensitivity AS ENUM ('low', 'medium', 'high');

-- Create ticket type enum
CREATE TYPE public.ticket_type AS ENUM ('alto', 'premium', 'medio', 'economico');

-- Create clients table with multi-tenant support
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  destination TEXT,
  status client_status NOT NULL DEFAULT 'lead',
  last_interaction TIMESTAMP WITH TIME ZONE DEFAULT now(),
  budgets_count INTEGER DEFAULT 0,
  travel_profile TEXT,
  average_budget NUMERIC(12,2) DEFAULT 0,
  destinations_of_interest TEXT[],
  hotel_preference TEXT,
  flight_class_preference TEXT,
  price_sensitivity price_sensitivity DEFAULT 'medium',
  relationship_status TEXT,
  ticket_type ticket_type DEFAULT 'medio',
  valor_lifetime NUMERIC(12,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for company_id lookups (multi-tenant)
CREATE INDEX idx_clients_company_id ON public.clients(company_id);

-- Create index for status filtering
CREATE INDEX idx_clients_status ON public.clients(status);

-- Create index for email lookups (for upsert)
CREATE INDEX idx_clients_email ON public.clients(email);

-- Enable Row Level Security
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see clients from their company
CREATE POLICY "Users can view clients from their company"
  ON public.clients
  FOR SELECT
  USING (company_id = auth.uid());

-- RLS Policy: Users can insert clients for their company
CREATE POLICY "Users can create clients for their company"
  ON public.clients
  FOR INSERT
  WITH CHECK (company_id = auth.uid());

-- RLS Policy: Users can update clients from their company
CREATE POLICY "Users can update clients from their company"
  ON public.clients
  FOR UPDATE
  USING (company_id = auth.uid());

-- RLS Policy: Users can delete clients from their company
CREATE POLICY "Users can delete clients from their company"
  ON public.clients
  FOR DELETE
  USING (company_id = auth.uid());

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();