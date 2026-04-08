-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  lookup_values — universāla tabula materiāliem, apdarēm, tipiem u.c.  ║
-- ║  Palaist Supabase SQL Editor: https://supabase.com/dashboard → SQL    ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- 1) Izveido tabulu
CREATE TABLE IF NOT EXISTS lookup_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,              -- 'material', 'finish', 'drawing_type'
  value TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2) Indekss ātrai filtrēšanai
CREATE INDEX IF NOT EXISTS idx_lookup_values_category ON lookup_values(category, sort_order);

-- 3) Unikāla kombinācija category + value
ALTER TABLE lookup_values ADD CONSTRAINT uq_lookup_category_value UNIQUE (category, value);

-- 4) RLS politikas
ALTER TABLE lookup_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow select lookup_values" ON lookup_values
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "allow insert lookup_values" ON lookup_values
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "allow update lookup_values" ON lookup_values
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "allow delete lookup_values" ON lookup_values
  FOR DELETE TO anon, authenticated USING (true);

-- 5) Iepriekš aizpilda ar esošajiem materiāliem
INSERT INTO lookup_values (category, value, sort_order) VALUES
  ('material', 'Koks', 0),
  ('material', 'Metāls', 1),
  ('material', 'Stikls', 2),
  ('material', 'Audums', 3),
  ('material', 'Āda', 4),
  ('material', 'Keramika', 5),
  ('material', 'Akmens', 6),
  ('material', 'Betons', 7)
ON CONFLICT (category, value) DO NOTHING;

-- 6) Iepriekš aizpilda ar esošajām apdarēm
INSERT INTO lookup_values (category, value, sort_order) VALUES
  ('finish', 'Matēts', 0),
  ('finish', 'Lakots', 1),
  ('finish', 'Pulēts', 2),
  ('finish', 'Krāsots', 3),
  ('finish', 'Dabīgs', 4),
  ('finish', 'Anodēts', 5),
  ('finish', 'Smilšstrūkl.', 6)
ON CONFLICT (category, value) DO NOTHING;

-- ✅ Gatavs! Pēc palaišanas Admin panelis uzreiz rādīs materiālus un apdares.

-- ══════════════════════════════════════════════════════════════════════════
-- RLS politikas arī categories, manufacturers, dealers tabulām
-- (ja vēl nav — lai Admin panelis var rakstīt/dzēst)
-- ══════════════════════════════════════════════════════════════════════════

-- Categories
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='categories' AND policyname='allow insert categories') THEN
    EXECUTE 'CREATE POLICY "allow insert categories" ON categories FOR INSERT TO anon, authenticated WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='categories' AND policyname='allow update categories') THEN
    EXECUTE 'CREATE POLICY "allow update categories" ON categories FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='categories' AND policyname='allow delete categories') THEN
    EXECUTE 'CREATE POLICY "allow delete categories" ON categories FOR DELETE TO anon, authenticated USING (true)';
  END IF;
END $$;

-- Manufacturers
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='manufacturers' AND policyname='allow insert manufacturers') THEN
    EXECUTE 'CREATE POLICY "allow insert manufacturers" ON manufacturers FOR INSERT TO anon, authenticated WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='manufacturers' AND policyname='allow update manufacturers') THEN
    EXECUTE 'CREATE POLICY "allow update manufacturers" ON manufacturers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='manufacturers' AND policyname='allow delete manufacturers') THEN
    EXECUTE 'CREATE POLICY "allow delete manufacturers" ON manufacturers FOR DELETE TO anon, authenticated USING (true)';
  END IF;
END $$;

-- Dealers
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='dealers' AND policyname='allow insert dealers') THEN
    EXECUTE 'CREATE POLICY "allow insert dealers" ON dealers FOR INSERT TO anon, authenticated WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='dealers' AND policyname='allow update dealers') THEN
    EXECUTE 'CREATE POLICY "allow update dealers" ON dealers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='dealers' AND policyname='allow delete dealers') THEN
    EXECUTE 'CREATE POLICY "allow delete dealers" ON dealers FOR DELETE TO anon, authenticated USING (true)';
  END IF;
END $$;
