-- Add gender column to nia_settings
ALTER TABLE public.nia_settings 
ADD COLUMN user_gender TEXT CHECK (user_gender IN ('masculino', 'feminino'));