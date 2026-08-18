
-- TAREFAS
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  titulo text NOT NULL,
  descricao text,
  status text DEFAULT 'pendente',
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tasks from their company"
ON public.tasks FOR SELECT
USING (company_id = auth.uid());

CREATE POLICY "Users can create tasks for their company"
ON public.tasks FOR INSERT
WITH CHECK (company_id = auth.uid());

CREATE POLICY "Users can update tasks from their company"
ON public.tasks FOR UPDATE
USING (company_id = auth.uid());

CREATE POLICY "Users can delete tasks from their company"
ON public.tasks FOR DELETE
USING (company_id = auth.uid());

-- FOLLOWUPS
CREATE TABLE public.followups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  tipo text,
  data_prevista timestamp with time zone,
  status text DEFAULT 'pendente',
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.followups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view followups from their company"
ON public.followups FOR SELECT
USING (company_id = auth.uid());

CREATE POLICY "Users can create followups for their company"
ON public.followups FOR INSERT
WITH CHECK (company_id = auth.uid());

CREATE POLICY "Users can update followups from their company"
ON public.followups FOR UPDATE
USING (company_id = auth.uid());

CREATE POLICY "Users can delete followups from their company"
ON public.followups FOR DELETE
USING (company_id = auth.uid());
