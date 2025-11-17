-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create cycle_tracking table
CREATE TABLE public.cycle_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  couple_space_id UUID NOT NULL REFERENCES public.couple_spaces(id) ON DELETE CASCADE,
  last_period_start DATE,
  cycle_length INTEGER NOT NULL DEFAULT 28,
  enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, couple_space_id)
);

-- Enable RLS
ALTER TABLE public.cycle_tracking ENABLE ROW LEVEL SECURITY;

-- Users can view and update their own cycle tracking
CREATE POLICY "Users can view their own cycle tracking"
ON public.cycle_tracking
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cycle tracking"
ON public.cycle_tracking
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cycle tracking"
ON public.cycle_tracking
FOR UPDATE
USING (auth.uid() = user_id);

-- Partners can view cycle tracking if enabled and they're in the same couple space
CREATE POLICY "Partners can view enabled cycle tracking"
ON public.cycle_tracking
FOR SELECT
USING (
  enabled = true AND
  EXISTS (
    SELECT 1
    FROM public.couple_members
    WHERE couple_members.couple_space_id = cycle_tracking.couple_space_id
      AND couple_members.user_id = auth.uid()
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_cycle_tracking_updated_at
BEFORE UPDATE ON public.cycle_tracking
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();