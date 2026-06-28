-- Add registration_status to events
-- Nullable: existing events remain unaffected; badge only renders when a value is set.
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS registration_status text
  CHECK (registration_status IN ('open', 'closing_soon', 'sold_out', 'coming_soon'));

-- Public aggregate function: returns the total save count for an event.
-- SECURITY DEFINER lets it bypass RLS so any caller gets the full count,
-- not just the current user's saves.
CREATE OR REPLACE FUNCTION public.get_event_save_count(p_event_id uuid)
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)
  FROM public.favourites
  WHERE entity_type = 'event'
    AND entity_id = p_event_id;
$$;
