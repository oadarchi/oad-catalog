-- ╔══════════════════════════════════════════════════════════════════╗
-- ║  category_materials & category_finishes — saistība starp       ║
-- ║  kategorijām un materiāliem/apdarēm                            ║
-- ║  Palaist Supabase SQL Editor PĒC lookup_values migrācijas      ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- 1) Kategorijas ↔ Materiāli
CREATE TABLE IF NOT EXISTS category_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  material TEXT NOT NULL,
  UNIQUE(category_id, material)
);

ALTER TABLE category_materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow all category_materials" ON category_materials FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 2) Kategorijas ↔ Apdares
CREATE TABLE IF NOT EXISTS category_finishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  finish TEXT NOT NULL,
  UNIQUE(category_id, finish)
);

ALTER TABLE category_finishes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow all category_finishes" ON category_finishes FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 3) Piemēra dati — Durvis kategorija ar atbilstošiem materiāliem
-- (Nomaini category_id uz savu reālo ID vai izpildi ar subquery)
INSERT INTO category_materials (category_id, material)
SELECT c.id, m.value
FROM categories c, (
  VALUES ('Koks'), ('Metāls'), ('Stikls'), ('Alumīnijs')
) AS m(value)
WHERE c.name = 'Durvis' AND c.parent_id IS NULL
ON CONFLICT DO NOTHING;

-- Furnitūra
INSERT INTO category_materials (category_id, material)
SELECT c.id, m.value
FROM categories c, (
  VALUES ('Metāls'), ('Nerūsējošais tērauds'), ('Alumīnijs')
) AS m(value)
WHERE c.name = 'Furnitūra' AND c.parent_id IS NULL
ON CONFLICT DO NOTHING;

-- ✅ Gatavs! Pēc palaišanas materiālu filtri rādīs tikai atbilstošos materiālus atkarībā no izvēlētās kategorijas.
-- Admin panelī vari pievienot vēl materiālus katrai kategorijai.
