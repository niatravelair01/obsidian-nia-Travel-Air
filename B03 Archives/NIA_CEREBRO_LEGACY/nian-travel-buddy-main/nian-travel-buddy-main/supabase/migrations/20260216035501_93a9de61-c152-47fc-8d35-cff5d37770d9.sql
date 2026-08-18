
CREATE TABLE public.follow_ups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  tipo text NOT NULL,
  status text DEFAULT 'pendente',
  data_agendada timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view follow_ups from their company"
ON public.follow_ups FOR SELECT
USING (company_id = auth.uid());

CREATE POLICY "Users can create follow_ups for their company"
ON public.follow_ups FOR INSERT
WITH CHECK (company_id = auth.uid());

CREATE POLICY "Users can update follow_ups from their company"
ON public.follow_ups FOR UPDATE
USING (company_id = auth.uid());

CREATE POLICY "Users can delete follow_ups from their company"
ON public.follow_ups FOR DELETE
USING (company_id = auth.uid());
