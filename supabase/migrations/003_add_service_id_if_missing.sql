-- Add service_id to slots if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'slots' AND column_name = 'service_id'
  ) THEN
    ALTER TABLE public.slots
    ADD COLUMN service_id UUID REFERENCES public.services(id) ON DELETE SET NULL;

    -- Create index if not exists (Postgres 9.5+ supports CREATE INDEX IF NOT EXISTS)
    PERFORM (
      CASE WHEN NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'idx_slots_service_id' AND n.nspname = 'public'
      ) THEN
        EXECUTE 'CREATE INDEX idx_slots_service_id ON public.slots(service_id)';
      END CASE
    );
  END IF;
END
$$;
