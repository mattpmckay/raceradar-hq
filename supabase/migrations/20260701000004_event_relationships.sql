-- ============================================================
-- Sprint 23: Event Intelligence Platform — Event Relationships
--
-- Creates event_relationships to express explicit cross-event
-- connections beyond what series_slug can capture.
--
-- series_slug already groups recurring annual editions of the
-- same event (e.g. HYROX Melbourne 2025 ↔ HYROX Melbourne 2026).
-- This table handles:
--   - same_series across cities (HYROX Melbourne ↔ HYROX Sydney)
--   - same_organiser (different events, same company)
--   - same_city (different series, same location/market)
--   - similar_discipline (editor-curated "you might also like")
--
-- Powers "Also in this series", "Similar events", and
-- internal linking for SEO.
--
-- Note: relationships are directional. Both A→B and B→A should
-- be inserted for symmetric discovery (e.g. via trigger or app).
--
-- Apply via: Supabase Dashboard → SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.event_relationships (
  id                 uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id           uuid        NOT NULL REFERENCES public.events (id) ON DELETE CASCADE,
  related_event_id   uuid        NOT NULL REFERENCES public.events (id) ON DELETE CASCADE,
  relationship_type  text        NOT NULL CHECK (relationship_type IN (
                                   'same_series',        -- same recurring series, different city or year
                                   'same_city',          -- different series, same metro area / market
                                   'same_organiser',     -- different events, run by same organiser
                                   'similar_discipline'  -- editor-curated recommendation
                                 )),
  sort_order         integer     NOT NULL DEFAULT 0,  -- lower = shown first
  created_at         timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT event_relationships_no_self CHECK (event_id <> related_event_id),
  UNIQUE (event_id, related_event_id, relationship_type)
);

ALTER TABLE public.event_relationships ENABLE ROW LEVEL SECURITY;

-- Public can read relationships where the source event is published
CREATE POLICY "Event relationships are publicly readable"
  ON public.event_relationships
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE id = event_id AND is_published = true
    )
  );

CREATE POLICY "Admins can manage event relationships"
  ON public.event_relationships
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS event_relationships_event_id_idx
  ON public.event_relationships (event_id, sort_order);

CREATE INDEX IF NOT EXISTS event_relationships_related_id_idx
  ON public.event_relationships (related_event_id);

-- ─── Verify ──────────────────────────────────────────────────────────────────
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public' AND table_name = 'event_relationships';
