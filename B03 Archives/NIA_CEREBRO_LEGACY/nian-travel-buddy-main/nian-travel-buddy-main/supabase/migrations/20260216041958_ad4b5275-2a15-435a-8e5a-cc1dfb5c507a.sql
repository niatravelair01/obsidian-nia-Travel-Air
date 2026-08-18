
-- Add client_id to tasks table with FK cascade
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE;

-- Enable realtime for clients table
ALTER PUBLICATION supabase_realtime ADD TABLE public.clients;
