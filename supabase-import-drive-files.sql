-- ╔══════════════════════════════════════════════════════════════════╗
-- ║  Batch import: 33 durvis faili no Google Drive                  ║
-- ║  Palaist Supabase SQL Editor                                    ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- 1) Kategorijas
INSERT INTO categories (name, slug, sort_order) VALUES ('Citi', 'citi', 0) ON CONFLICT DO NOTHING;
INSERT INTO categories (name, slug, sort_order) VALUES ('Durvis', 'durvis', 0) ON CONFLICT DO NOTHING;
INSERT INTO categories (name, slug, sort_order) VALUES ('Furnitūra', 'furnitura', 0) ON CONFLICT DO NOTHING;

-- 2) Apakškategorijas
INSERT INTO categories (name, slug, parent_id, sort_order) 
  SELECT 'Citi', 'citi', id, 0 FROM categories WHERE name = 'Citi' AND parent_id IS NULL
  ON CONFLICT DO NOTHING;
INSERT INTO categories (name, slug, parent_id, sort_order) 
  SELECT 'Cenu piedāvājumi', 'cenu-piedavajumi', id, 0 FROM categories WHERE name = 'Durvis' AND parent_id IS NULL
  ON CONFLICT DO NOTHING;
INSERT INTO categories (name, slug, parent_id, sort_order) 
  SELECT 'Citi', 'citi', id, 0 FROM categories WHERE name = 'Durvis' AND parent_id IS NULL
  ON CONFLICT DO NOTHING;
INSERT INTO categories (name, slug, parent_id, sort_order) 
  SELECT 'Evakuācijas durvis', 'evakuacijas-durvis', id, 0 FROM categories WHERE name = 'Durvis' AND parent_id IS NULL
  ON CONFLICT DO NOTHING;
INSERT INTO categories (name, slug, parent_id, sort_order) 
  SELECT 'Ieejas durvis', 'ieejas-durvis', id, 0 FROM categories WHERE name = 'Durvis' AND parent_id IS NULL
  ON CONFLICT DO NOTHING;
INSERT INTO categories (name, slug, parent_id, sort_order) 
  SELECT 'Mezgli', 'mezgli', id, 0 FROM categories WHERE name = 'Durvis' AND parent_id IS NULL
  ON CONFLICT DO NOTHING;
INSERT INTO categories (name, slug, parent_id, sort_order) 
  SELECT 'Numurēšana', 'numuresana', id, 0 FROM categories WHERE name = 'Durvis' AND parent_id IS NULL
  ON CONFLICT DO NOTHING;
INSERT INTO categories (name, slug, parent_id, sort_order) 
  SELECT 'Pivot durvis', 'pivot-durvis', id, 0 FROM categories WHERE name = 'Durvis' AND parent_id IS NULL
  ON CONFLICT DO NOTHING;
INSERT INTO categories (name, slug, parent_id, sort_order) 
  SELECT 'Specifikācijas', 'specifikacijas', id, 0 FROM categories WHERE name = 'Durvis' AND parent_id IS NULL
  ON CONFLICT DO NOTHING;
INSERT INTO categories (name, slug, parent_id, sort_order) 
  SELECT 'Eņģes', 'enģes', id, 0 FROM categories WHERE name = 'Furnitūra' AND parent_id IS NULL
  ON CONFLICT DO NOTHING;
INSERT INTO categories (name, slug, parent_id, sort_order) 
  SELECT 'Rokturi', 'rokturi', id, 0 FROM categories WHERE name = 'Furnitūra' AND parent_id IS NULL
  ON CONFLICT DO NOTHING;
INSERT INTO categories (name, slug, parent_id, sort_order) 
  SELECT 'Vispārīgi', 'visparigi', id, 0 FROM categories WHERE name = 'Furnitūra' AND parent_id IS NULL
  ON CONFLICT DO NOTHING;

-- 3) Drawings
-- Pievienojam thumbnail_url kolonnu, ja tā vēl neeksistē
ALTER TABLE drawings ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE drawings ADD COLUMN IF NOT EXISTS drive_file_id TEXT;

INSERT INTO drawings (name, file_url, thumbnail_url, drive_file_id, drawing_type, status, materials, finishes, tags, page_count,
  category_id, subcategory_id)
SELECT 
  'Logu un durvju furnituras specifikācija.xlsx',
  'https://drive.google.com/file/d/16zZv6ZEA7H1UwAK8W-RXObk9c9Yudz65/view',
  'https://drive.google.com/thumbnail?id=16zZv6ZEA7H1UwAK8W-RXObk9c9Yudz65&sz=w400',
  '16zZv6ZEA7H1UwAK8W-RXObk9c9Yudz65',
  'custom_made', 'active', ARRAY[]::text[], ARRAY[]::text[], ARRAY['xlsx']::text[], 1,
  (SELECT id FROM categories WHERE name = 'Furnitūra' AND parent_id IS NULL LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Vispārīgi' AND parent_id IS NOT NULL LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM drawings WHERE drive_file_id = '16zZv6ZEA7H1UwAK8W-RXObk9c9Yudz65');

INSERT INTO drawings (name, file_url, thumbnail_url, drive_file_id, drawing_type, status, materials, finishes, tags, page_count,
  category_id, subcategory_id)
SELECT 
  'a05-05-03_Durvju_Mezgls.pdf',
  'https://drive.google.com/file/d/1qxn4lnNCpzdVFzJtK_7vD7lm97V0HxbM/view',
  'https://drive.google.com/thumbnail?id=1qxn4lnNCpzdVFzJtK_7vD7lm97V0HxbM&sz=w400',
  '1qxn4lnNCpzdVFzJtK_7vD7lm97V0HxbM',
  'custom_made', 'active', ARRAY[]::text[], ARRAY[]::text[], ARRAY['pdf']::text[], 1,
  (SELECT id FROM categories WHERE name = 'Durvis' AND parent_id IS NULL LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Mezgli' AND parent_id IS NOT NULL LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM drawings WHERE drive_file_id = '1qxn4lnNCpzdVFzJtK_7vD7lm97V0HxbM');

INSERT INTO drawings (name, file_url, thumbnail_url, drive_file_id, drawing_type, status, materials, finishes, tags, page_count,
  category_id, subcategory_id)
SELECT 
  'Untitled Extract Pages.pdf',
  'https://drive.google.com/file/d/1B3lb4lMuC3DQou5A38wqO_6GSyj4Td5f/view',
  'https://drive.google.com/thumbnail?id=1B3lb4lMuC3DQou5A38wqO_6GSyj4Td5f&sz=w400',
  '1B3lb4lMuC3DQou5A38wqO_6GSyj4Td5f',
  'custom_made', 'active', ARRAY[]::text[], ARRAY[]::text[], ARRAY['pdf']::text[], 1,
  (SELECT id FROM categories WHERE name = 'Durvis' AND parent_id IS NULL LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Citi' AND parent_id IS NOT NULL LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM drawings WHERE drive_file_id = '1B3lb4lMuC3DQou5A38wqO_6GSyj4Td5f');

INSERT INTO drawings (name, file_url, thumbnail_url, drive_file_id, drawing_type, status, materials, finishes, tags, page_count,
  category_id, subcategory_id)
SELECT 
  'ARD-2-4-4-06_DURVJU_SPECIFIKACIJA.pdf',
  'https://drive.google.com/file/d/1KzVMIyzIpGHJpJPZ4Cttub6AzAQhWC4v/view',
  'https://drive.google.com/thumbnail?id=1KzVMIyzIpGHJpJPZ4Cttub6AzAQhWC4v&sz=w400',
  '1KzVMIyzIpGHJpJPZ4Cttub6AzAQhWC4v',
  'custom_made', 'active', ARRAY[]::text[], ARRAY[]::text[], ARRAY['pdf']::text[], 1,
  (SELECT id FROM categories WHERE name = 'Durvis' AND parent_id IS NULL LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Specifikācijas' AND parent_id IS NOT NULL LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM drawings WHERE drive_file_id = '1KzVMIyzIpGHJpJPZ4Cttub6AzAQhWC4v');

INSERT INTO drawings (name, file_url, thumbnail_url, drive_file_id, drawing_type, status, materials, finishes, tags, page_count,
  category_id, subcategory_id)
SELECT 
  'BP_6-DURIVS.pdf',
  'https://drive.google.com/file/d/1JYj8aZT99_e0SVz29rqrp1phKdznLnrs/view',
  'https://drive.google.com/thumbnail?id=1JYj8aZT99_e0SVz29rqrp1phKdznLnrs&sz=w400',
  '1JYj8aZT99_e0SVz29rqrp1phKdznLnrs',
  'custom_made', 'active', ARRAY[]::text[], ARRAY[]::text[], ARRAY['pdf']::text[], 1,
  (SELECT id FROM categories WHERE name = 'Durvis' AND parent_id IS NULL LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Citi' AND parent_id IS NOT NULL LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM drawings WHERE drive_file_id = '1JYj8aZT99_e0SVz29rqrp1phKdznLnrs');

INSERT INTO drawings (name, file_url, thumbnail_url, drive_file_id, drawing_type, status, materials, finishes, tags, page_count,
  category_id, subcategory_id)
SELECT 
  'ARD-2.3.6-05 - DZĪVOKĻU NUMURS.pdf',
  'https://drive.google.com/file/d/1V1d2Ia3MohwA9DZtT6wc_Ywm1ntj6DhU/view',
  'https://drive.google.com/thumbnail?id=1V1d2Ia3MohwA9DZtT6wc_Ywm1ntj6DhU&sz=w400',
  '1V1d2Ia3MohwA9DZtT6wc_Ywm1ntj6DhU',
  'custom_made', 'active', ARRAY[]::text[], ARRAY[]::text[], ARRAY['pdf']::text[], 1,
  (SELECT id FROM categories WHERE name = 'Durvis' AND parent_id IS NULL LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Numurēšana' AND parent_id IS NOT NULL LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM drawings WHERE drive_file_id = '1V1d2Ia3MohwA9DZtT6wc_Ywm1ntj6DhU');

INSERT INTO drawings (name, file_url, thumbnail_url, drive_file_id, drawing_type, status, materials, finishes, tags, page_count,
  category_id, subcategory_id)
SELECT 
  'DURVJU_ROKTURIS2.pdf',
  'https://drive.google.com/file/d/13XHER3gpl5TKPZACEYizZexf7T43jl9T/view',
  'https://drive.google.com/thumbnail?id=13XHER3gpl5TKPZACEYizZexf7T43jl9T&sz=w400',
  '13XHER3gpl5TKPZACEYizZexf7T43jl9T',
  'custom_made', 'active', ARRAY[]::text[], ARRAY[]::text[], ARRAY['pdf']::text[], 1,
  (SELECT id FROM categories WHERE name = 'Furnitūra' AND parent_id IS NULL LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Rokturi' AND parent_id IS NOT NULL LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM drawings WHERE drive_file_id = '13XHER3gpl5TKPZACEYizZexf7T43jl9T');

INSERT INTO drawings (name, file_url, thumbnail_url, drive_file_id, drawing_type, status, materials, finishes, tags, page_count,
  category_id, subcategory_id)
SELECT 
  'DURVJU_ROKTURIS.pdf',
  'https://drive.google.com/file/d/1Ah_JiA8iqXV6l_GQUanvhsyAnw5hRd8_/view',
  'https://drive.google.com/thumbnail?id=1Ah_JiA8iqXV6l_GQUanvhsyAnw5hRd8_&sz=w400',
  '1Ah_JiA8iqXV6l_GQUanvhsyAnw5hRd8_',
  'custom_made', 'active', ARRAY[]::text[], ARRAY[]::text[], ARRAY['pdf']::text[], 1,
  (SELECT id FROM categories WHERE name = 'Furnitūra' AND parent_id IS NULL LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Rokturi' AND parent_id IS NOT NULL LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM drawings WHERE drive_file_id = '1Ah_JiA8iqXV6l_GQUanvhsyAnw5hRd8_');

INSERT INTO drawings (name, file_url, thumbnail_url, drive_file_id, drawing_type, status, materials, finishes, tags, page_count,
  category_id, subcategory_id)
SELECT 
  'AR_A_durvis_2.pdf',
  'https://drive.google.com/file/d/1CwlewfjDRRqwfcSzkLvcT4fbBb-X8zlE/view',
  'https://drive.google.com/thumbnail?id=1CwlewfjDRRqwfcSzkLvcT4fbBb-X8zlE&sz=w400',
  '1CwlewfjDRRqwfcSzkLvcT4fbBb-X8zlE',
  'custom_made', 'active', ARRAY[]::text[], ARRAY[]::text[], ARRAY['pdf']::text[], 1,
  (SELECT id FROM categories WHERE name = 'Durvis' AND parent_id IS NULL LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Specifikācijas' AND parent_id IS NOT NULL LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM drawings WHERE drive_file_id = '1CwlewfjDRRqwfcSzkLvcT4fbBb-X8zlE');

INSERT INTO drawings (name, file_url, thumbnail_url, drive_file_id, drawing_type, status, materials, finishes, tags, page_count,
  category_id, subcategory_id)
SELECT 
  'Durvju specifikācija_detalizēta.xlsx',
  'https://drive.google.com/file/d/1FJDn213FJk_DdwhdZuDEwIHRLCdT-fJB/view',
  'https://drive.google.com/thumbnail?id=1FJDn213FJk_DdwhdZuDEwIHRLCdT-fJB&sz=w400',
  '1FJDn213FJk_DdwhdZuDEwIHRLCdT-fJB',
  'custom_made', 'active', ARRAY[]::text[], ARRAY[]::text[], ARRAY['xlsx']::text[], 1,
  (SELECT id FROM categories WHERE name = 'Durvis' AND parent_id IS NULL LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Specifikācijas' AND parent_id IS NOT NULL LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM drawings WHERE drive_file_id = '1FJDn213FJk_DdwhdZuDEwIHRLCdT-fJB');

INSERT INTO drawings (name, file_url, thumbnail_url, drive_file_id, drawing_type, status, materials, finishes, tags, page_count,
  category_id, subcategory_id)
SELECT 
  'Logu un durvju specifikācija.pdf',
  'https://drive.google.com/file/d/1lt4aODJvT7TsIIxAIT0aHs13yvXNFYdK/view',
  'https://drive.google.com/thumbnail?id=1lt4aODJvT7TsIIxAIT0aHs13yvXNFYdK&sz=w400',
  '1lt4aODJvT7TsIIxAIT0aHs13yvXNFYdK',
  'custom_made', 'active', ARRAY[]::text[], ARRAY[]::text[], ARRAY['pdf']::text[], 1,
  (SELECT id FROM categories WHERE name = 'Durvis' AND parent_id IS NULL LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Specifikācijas' AND parent_id IS NOT NULL LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM drawings WHERE drive_file_id = '1lt4aODJvT7TsIIxAIT0aHs13yvXNFYdK');

INSERT INTO drawings (name, file_url, thumbnail_url, drive_file_id, drawing_type, status, materials, finishes, tags, page_count,
  category_id, subcategory_id)
SELECT 
  'ARD-4 - DURVJU SPECIFIKĀCIJA (2).pdf',
  'https://drive.google.com/file/d/1PNDrCfEuxeVQbljL1gsHz5MirYRIE0Kr/view',
  'https://drive.google.com/thumbnail?id=1PNDrCfEuxeVQbljL1gsHz5MirYRIE0Kr&sz=w400',
  '1PNDrCfEuxeVQbljL1gsHz5MirYRIE0Kr',
  'custom_made', 'active', ARRAY[]::text[], ARRAY[]::text[], ARRAY['pdf']::text[], 1,
  (SELECT id FROM categories WHERE name = 'Durvis' AND parent_id IS NULL LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Specifikācijas' AND parent_id IS NOT NULL LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM drawings WHERE drive_file_id = '1PNDrCfEuxeVQbljL1gsHz5MirYRIE0Kr');

INSERT INTO drawings (name, file_url, thumbnail_url, drive_file_id, drawing_type, status, materials, finishes, tags, page_count,
  category_id, subcategory_id)
SELECT 
  'ARD-2-4-4-08_DURVJU_SPECIFIKACIJA.pdf',
  'https://drive.google.com/file/d/1K5_lLgogAxZChq9g2DA7R92zhifVDs3Z/view',
  'https://drive.google.com/thumbnail?id=1K5_lLgogAxZChq9g2DA7R92zhifVDs3Z&sz=w400',
  '1K5_lLgogAxZChq9g2DA7R92zhifVDs3Z',
  'custom_made', 'active', ARRAY[]::text[], ARRAY[]::text[], ARRAY['pdf']::text[], 1,
  (SELECT id FROM categories WHERE name = 'Durvis' AND parent_id IS NULL LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Specifikācijas' AND parent_id IS NOT NULL LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM drawings WHERE drive_file_id = '1K5_lLgogAxZChq9g2DA7R92zhifVDs3Z');

INSERT INTO drawings (name, file_url, thumbnail_url, drive_file_id, drawing_type, status, materials, finishes, tags, page_count,
  category_id, subcategory_id)
SELECT 
  'Evakuācijas durvis.xlsx',
  'https://drive.google.com/file/d/1CrKG0pt3QoBcM_4Pm2RA6vSXqJ347jFV/view',
  'https://drive.google.com/thumbnail?id=1CrKG0pt3QoBcM_4Pm2RA6vSXqJ347jFV&sz=w400',
  '1CrKG0pt3QoBcM_4Pm2RA6vSXqJ347jFV',
  'custom_made', 'active', ARRAY[]::text[], ARRAY[]::text[], ARRAY['xlsx']::text[], 1,
  (SELECT id FROM categories WHERE name = 'Durvis' AND parent_id IS NULL LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Evakuācijas durvis' AND parent_id IS NOT NULL LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM drawings WHERE drive_file_id = '1CrKG0pt3QoBcM_4Pm2RA6vSXqJ347jFV');

INSERT INTO drawings (name, file_url, thumbnail_url, drive_file_id, drawing_type, status, materials, finishes, tags, page_count,
  category_id, subcategory_id)
SELECT 
  'AR_A_durvis_1.pdf',
  'https://drive.google.com/file/d/1EtdqVI5_mBSH2G27NeQltwnvgIlOVgo4/view',
  'https://drive.google.com/thumbnail?id=1EtdqVI5_mBSH2G27NeQltwnvgIlOVgo4&sz=w400',
  '1EtdqVI5_mBSH2G27NeQltwnvgIlOVgo4',
  'custom_made', 'active', ARRAY[]::text[], ARRAY[]::text[], ARRAY['pdf']::text[], 1,
  (SELECT id FROM categories WHERE name = 'Durvis' AND parent_id IS NULL LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Specifikācijas' AND parent_id IS NOT NULL LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM drawings WHERE drive_file_id = '1EtdqVI5_mBSH2G27NeQltwnvgIlOVgo4');

INSERT INTO drawings (name, file_url, thumbnail_url, drive_file_id, drawing_type, status, materials, finishes, tags, page_count,
  category_id, subcategory_id)
SELECT 
  'ARD-2.3.6-04 - DURVJU DETAĻU SPECIFIKĀCIJA.pdf',
  'https://drive.google.com/file/d/1QbK_iMrGT21RqW5jlh5UnpBqMlew8Lck/view',
  'https://drive.google.com/thumbnail?id=1QbK_iMrGT21RqW5jlh5UnpBqMlew8Lck&sz=w400',
  '1QbK_iMrGT21RqW5jlh5UnpBqMlew8Lck',
  'custom_made', 'active', ARRAY[]::text[], ARRAY[]::text[], ARRAY['pdf']::text[], 1,
  (SELECT id FROM categories WHERE name = 'Durvis' AND parent_id IS NULL LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Specifikācijas' AND parent_id IS NOT NULL LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM drawings WHERE drive_file_id = '1QbK_iMrGT21RqW5jlh5UnpBqMlew8Lck');

INSERT INTO drawings (name, file_url, thumbnail_url, drive_file_id, drawing_type, status, materials, finishes, tags, page_count,
  category_id, subcategory_id)
SELECT 
  '2.3-2-5.04 - Ēka 2. Iekšdurvju specifikācija (2).pdf',
  'https://drive.google.com/file/d/1g6znhuSrE3LbHDbwdi5W3fwrz95vwsTX/view',
  'https://drive.google.com/thumbnail?id=1g6znhuSrE3LbHDbwdi5W3fwrz95vwsTX&sz=w400',
  '1g6znhuSrE3LbHDbwdi5W3fwrz95vwsTX',
  'custom_made', 'active', ARRAY[]::text[], ARRAY[]::text[], ARRAY['pdf']::text[], 1,
  (SELECT id FROM categories WHERE name = 'Durvis' AND parent_id IS NULL LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Specifikācijas' AND parent_id IS NOT NULL LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM drawings WHERE drive_file_id = '1g6znhuSrE3LbHDbwdi5W3fwrz95vwsTX');

INSERT INTO drawings (name, file_url, thumbnail_url, drive_file_id, drawing_type, status, materials, finishes, tags, page_count,
  category_id, subcategory_id)
SELECT 
  'DZ21_Dzivoklu_ardurvju_rokturis.pdf',
  'https://drive.google.com/file/d/18K_5V8bTiShY5mkh6FQhvy1A3Lu0Jf1Q/view',
  'https://drive.google.com/thumbnail?id=18K_5V8bTiShY5mkh6FQhvy1A3Lu0Jf1Q&sz=w400',
  '18K_5V8bTiShY5mkh6FQhvy1A3Lu0Jf1Q',
  'custom_made', 'active', ARRAY[]::text[], ARRAY[]::text[], ARRAY['pdf']::text[], 1,
  (SELECT id FROM categories WHERE name = 'Furnitūra' AND parent_id IS NULL LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Rokturi' AND parent_id IS NOT NULL LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM drawings WHERE drive_file_id = '18K_5V8bTiShY5mkh6FQhvy1A3Lu0Jf1Q');

INSERT INTO drawings (name, file_url, thumbnail_url, drive_file_id, drawing_type, status, materials, finishes, tags, page_count,
  category_id, subcategory_id)
SELECT 
  'AR_B_233-02_DURVJU_SPECi-Layout1.pdf',
  'https://drive.google.com/file/d/1sO_ril6HMN6CqN7qU29JXaBqDVcX6zIJ/view',
  'https://drive.google.com/thumbnail?id=1sO_ril6HMN6CqN7qU29JXaBqDVcX6zIJ&sz=w400',
  '1sO_ril6HMN6CqN7qU29JXaBqDVcX6zIJ',
  'custom_made', 'active', ARRAY[]::text[], ARRAY[]::text[], ARRAY['pdf']::text[], 1,
  (SELECT id FROM categories WHERE name = 'Durvis' AND parent_id IS NULL LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Specifikācijas' AND parent_id IS NOT NULL LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM drawings WHERE drive_file_id = '1sO_ril6HMN6CqN7qU29JXaBqDVcX6zIJ');

INSERT INTO drawings (name, file_url, thumbnail_url, drive_file_id, drawing_type, status, materials, finishes, tags, page_count,
  category_id, subcategory_id)
SELECT 
  '2-3-A-ARD-5-03 - Ēka A- Iekšdurvju specifikācija.pdf',
  'https://drive.google.com/file/d/1KIZAaXbQci5dMFP-x0bv1_NZrH3SFymx/view',
  'https://drive.google.com/thumbnail?id=1KIZAaXbQci5dMFP-x0bv1_NZrH3SFymx&sz=w400',
  '1KIZAaXbQci5dMFP-x0bv1_NZrH3SFymx',
  'custom_made', 'active', ARRAY[]::text[], ARRAY[]::text[], ARRAY['pdf']::text[], 1,
  (SELECT id FROM categories WHERE name = 'Durvis' AND parent_id IS NULL LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Specifikācijas' AND parent_id IS NOT NULL LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM drawings WHERE drive_file_id = '1KIZAaXbQci5dMFP-x0bv1_NZrH3SFymx');

INSERT INTO drawings (name, file_url, thumbnail_url, drive_file_id, drawing_type, status, materials, finishes, tags, page_count,
  category_id, subcategory_id)
SELECT 
  'WF Cenu piedāvājum Durvis Berģos..pdf',
  'https://drive.google.com/file/d/1iJvyIHgZwuNbEFuio9EkgI8IywitvBAk/view',
  'https://drive.google.com/thumbnail?id=1iJvyIHgZwuNbEFuio9EkgI8IywitvBAk&sz=w400',
  '1iJvyIHgZwuNbEFuio9EkgI8IywitvBAk',
  'custom_made', 'active', ARRAY[]::text[], ARRAY[]::text[], ARRAY['pdf']::text[], 1,
  (SELECT id FROM categories WHERE name = 'Durvis' AND parent_id IS NULL LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Cenu piedāvājumi' AND parent_id IS NOT NULL LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM drawings WHERE drive_file_id = '1iJvyIHgZwuNbEFuio9EkgI8IywitvBAk');

INSERT INTO drawings (name, file_url, thumbnail_url, drive_file_id, drawing_type, status, materials, finishes, tags, page_count,
  category_id, subcategory_id)
SELECT 
  'ARD-2-4-4-05_DURVJU_SPECIFIKACIJA (2).pdf',
  'https://drive.google.com/file/d/1C_HbuIDmhasxS0o36KjFKlglBx5lkzIg/view',
  'https://drive.google.com/thumbnail?id=1C_HbuIDmhasxS0o36KjFKlglBx5lkzIg&sz=w400',
  '1C_HbuIDmhasxS0o36KjFKlglBx5lkzIg',
  'custom_made', 'active', ARRAY[]::text[], ARRAY[]::text[], ARRAY['pdf']::text[], 1,
  (SELECT id FROM categories WHERE name = 'Durvis' AND parent_id IS NULL LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Specifikācijas' AND parent_id IS NOT NULL LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM drawings WHERE drive_file_id = '1C_HbuIDmhasxS0o36KjFKlglBx5lkzIg');

INSERT INTO drawings (name, file_url, thumbnail_url, drive_file_id, drawing_type, status, materials, finishes, tags, page_count,
  category_id, subcategory_id)
SELECT 
  'ARD-2.4.5-01 - DURVJU SPECIFIKĀCIJA (3).pdf',
  'https://drive.google.com/file/d/1alqN4WT2MCXUA0lCMVjsdg2puOaJtGz3/view',
  'https://drive.google.com/thumbnail?id=1alqN4WT2MCXUA0lCMVjsdg2puOaJtGz3&sz=w400',
  '1alqN4WT2MCXUA0lCMVjsdg2puOaJtGz3',
  'custom_made', 'active', ARRAY[]::text[], ARRAY[]::text[], ARRAY['pdf']::text[], 1,
  (SELECT id FROM categories WHERE name = 'Durvis' AND parent_id IS NULL LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Specifikācijas' AND parent_id IS NOT NULL LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM drawings WHERE drive_file_id = '1alqN4WT2MCXUA0lCMVjsdg2puOaJtGz3');

INSERT INTO drawings (name, file_url, thumbnail_url, drive_file_id, drawing_type, status, materials, finishes, tags, page_count,
  category_id, subcategory_id)
SELECT 
  'ARD-2-4-4-09_DURVJU_SPECIFIKACIJA.pdf',
  'https://drive.google.com/file/d/1N8DIbgi1tveEsP4PYOJ_mXMvj_IMavek/view',
  'https://drive.google.com/thumbnail?id=1N8DIbgi1tveEsP4PYOJ_mXMvj_IMavek&sz=w400',
  '1N8DIbgi1tveEsP4PYOJ_mXMvj_IMavek',
  'custom_made', 'active', ARRAY[]::text[], ARRAY[]::text[], ARRAY['pdf']::text[], 1,
  (SELECT id FROM categories WHERE name = 'Durvis' AND parent_id IS NULL LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Specifikācijas' AND parent_id IS NOT NULL LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM drawings WHERE drive_file_id = '1N8DIbgi1tveEsP4PYOJ_mXMvj_IMavek');

INSERT INTO drawings (name, file_url, thumbnail_url, drive_file_id, drawing_type, status, materials, finishes, tags, page_count,
  category_id, subcategory_id)
SELECT 
  'ARD-2-3-6-01 - DURVJU SPECIFIKĀCIJA.pdf',
  'https://drive.google.com/file/d/1ie1zsvKK_mjYnV452gQGUNrDd-h42Ud8/view',
  'https://drive.google.com/thumbnail?id=1ie1zsvKK_mjYnV452gQGUNrDd-h42Ud8&sz=w400',
  '1ie1zsvKK_mjYnV452gQGUNrDd-h42Ud8',
  'custom_made', 'active', ARRAY[]::text[], ARRAY[]::text[], ARRAY['pdf']::text[], 1,
  (SELECT id FROM categories WHERE name = 'Durvis' AND parent_id IS NULL LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Specifikācijas' AND parent_id IS NOT NULL LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM drawings WHERE drive_file_id = '1ie1zsvKK_mjYnV452gQGUNrDd-h42Ud8');

INSERT INTO drawings (name, file_url, thumbnail_url, drive_file_id, drawing_type, status, materials, finishes, tags, page_count,
  category_id, subcategory_id)
SELECT 
  'IZM_SMO_IP_1.04_ПЛАН ПОТОЛКА.pdf',
  'https://drive.google.com/file/d/14GBWxMuPTrQpPvPommu-g1Yk6tgr01xu/view',
  'https://drive.google.com/thumbnail?id=14GBWxMuPTrQpPvPommu-g1Yk6tgr01xu&sz=w400',
  '14GBWxMuPTrQpPvPommu-g1Yk6tgr01xu',
  'custom_made', 'active', ARRAY[]::text[], ARRAY[]::text[], ARRAY['pdf']::text[], 1,
  (SELECT id FROM categories WHERE name = 'Citi' AND parent_id IS NULL LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Citi' AND parent_id IS NOT NULL LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM drawings WHERE drive_file_id = '14GBWxMuPTrQpPvPommu-g1Yk6tgr01xu');

INSERT INTO drawings (name, file_url, thumbnail_url, drive_file_id, drawing_type, status, materials, finishes, tags, page_count,
  category_id, subcategory_id)
SELECT 
  'ARD-2.4.5-01 - DURVJU SPECIFIKĀCIJA (4).pdf',
  'https://drive.google.com/file/d/14cvJdoTJP46IdqpEAz_enCN36cQRi0jc/view',
  'https://drive.google.com/thumbnail?id=14cvJdoTJP46IdqpEAz_enCN36cQRi0jc&sz=w400',
  '14cvJdoTJP46IdqpEAz_enCN36cQRi0jc',
  'custom_made', 'active', ARRAY[]::text[], ARRAY[]::text[], ARRAY['pdf']::text[], 1,
  (SELECT id FROM categories WHERE name = 'Durvis' AND parent_id IS NULL LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Specifikācijas' AND parent_id IS NOT NULL LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM drawings WHERE drive_file_id = '14cvJdoTJP46IdqpEAz_enCN36cQRi0jc');

INSERT INTO drawings (name, file_url, thumbnail_url, drive_file_id, drawing_type, status, materials, finishes, tags, page_count,
  category_id, subcategory_id)
SELECT 
  '85828_Haus_Eingangstueren_Thermo65_Thermo46_LV(11).pdf',
  'https://drive.google.com/file/d/1b3vrbxJn3o5_chOGrDJjYnDWuXrC1GcG/view',
  'https://drive.google.com/thumbnail?id=1b3vrbxJn3o5_chOGrDJjYnDWuXrC1GcG&sz=w400',
  '1b3vrbxJn3o5_chOGrDJjYnDWuXrC1GcG',
  'custom_made', 'active', ARRAY[]::text[], ARRAY[]::text[], ARRAY['pdf']::text[], 1,
  (SELECT id FROM categories WHERE name = 'Durvis' AND parent_id IS NULL LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Ieejas durvis' AND parent_id IS NOT NULL LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM drawings WHERE drive_file_id = '1b3vrbxJn3o5_chOGrDJjYnDWuXrC1GcG');

INSERT INTO drawings (name, file_url, thumbnail_url, drive_file_id, drawing_type, status, materials, finishes, tags, page_count,
  category_id, subcategory_id)
SELECT 
  'SMO_IP_1.09_СПЕЦИФИКАЦИЯ ДВЕРЕЙ .pdf',
  'https://drive.google.com/file/d/1RrN8ZeBFz34w2JyMELQBUzmrJot-7Q9_/view',
  'https://drive.google.com/thumbnail?id=1RrN8ZeBFz34w2JyMELQBUzmrJot-7Q9_&sz=w400',
  '1RrN8ZeBFz34w2JyMELQBUzmrJot-7Q9_',
  'custom_made', 'active', ARRAY[]::text[], ARRAY[]::text[], ARRAY['pdf']::text[], 1,
  (SELECT id FROM categories WHERE name = 'Durvis' AND parent_id IS NULL LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Specifikācijas' AND parent_id IS NOT NULL LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM drawings WHERE drive_file_id = '1RrN8ZeBFz34w2JyMELQBUzmrJot-7Q9_');

INSERT INTO drawings (name, file_url, thumbnail_url, drive_file_id, drawing_type, status, materials, finishes, tags, page_count,
  category_id, subcategory_id)
SELECT 
  'Hinges_Oildinamic_150kg.pdf',
  'https://drive.google.com/file/d/11P7MDU4IpRQPxvu5E7vKsBpWH7N2vPyQ/view',
  'https://drive.google.com/thumbnail?id=11P7MDU4IpRQPxvu5E7vKsBpWH7N2vPyQ&sz=w400',
  '11P7MDU4IpRQPxvu5E7vKsBpWH7N2vPyQ',
  'custom_made', 'active', ARRAY[]::text[], ARRAY[]::text[], ARRAY['pdf']::text[], 1,
  (SELECT id FROM categories WHERE name = 'Furnitūra' AND parent_id IS NULL LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Eņģes' AND parent_id IS NOT NULL LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM drawings WHERE drive_file_id = '11P7MDU4IpRQPxvu5E7vKsBpWH7N2vPyQ');

INSERT INTO drawings (name, file_url, thumbnail_url, drive_file_id, drawing_type, status, materials, finishes, tags, page_count,
  category_id, subcategory_id)
SELECT 
  '2019-12-11 19_14_20-DURVJU MEZGLI_ - OneNote.jpg',
  'https://drive.google.com/file/d/1itH6OinA9dKEbf6nY7y_z0vYJAlsSubn/view',
  'https://drive.google.com/thumbnail?id=1itH6OinA9dKEbf6nY7y_z0vYJAlsSubn&sz=w400',
  '1itH6OinA9dKEbf6nY7y_z0vYJAlsSubn',
  'custom_made', 'active', ARRAY[]::text[], ARRAY[]::text[], ARRAY['jpg']::text[], 1,
  (SELECT id FROM categories WHERE name = 'Durvis' AND parent_id IS NULL LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Mezgli' AND parent_id IS NOT NULL LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM drawings WHERE drive_file_id = '1itH6OinA9dKEbf6nY7y_z0vYJAlsSubn');

INSERT INTO drawings (name, file_url, thumbnail_url, drive_file_id, drawing_type, status, materials, finishes, tags, page_count,
  category_id, subcategory_id)
SELECT 
  'Bodor_KTM_Assembling instructions pivoting system BKM.pdf',
  'https://drive.google.com/file/d/1DE3aK7HYGierxPYNi-GdkX6nCA_J6QW9/view',
  'https://drive.google.com/thumbnail?id=1DE3aK7HYGierxPYNi-GdkX6nCA_J6QW9&sz=w400',
  '1DE3aK7HYGierxPYNi-GdkX6nCA_J6QW9',
  'custom_made', 'active', ARRAY[]::text[], ARRAY[]::text[], ARRAY['pdf']::text[], 1,
  (SELECT id FROM categories WHERE name = 'Durvis' AND parent_id IS NULL LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Pivot durvis' AND parent_id IS NOT NULL LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM drawings WHERE drive_file_id = '1DE3aK7HYGierxPYNi-GdkX6nCA_J6QW9');

INSERT INTO drawings (name, file_url, thumbnail_url, drive_file_id, drawing_type, status, materials, finishes, tags, page_count,
  category_id, subcategory_id)
SELECT 
  'Pivot doors.docx',
  'https://drive.google.com/file/d/1pN1YUxcXCnUVE-he711_6KYcIJcSxMNV/view',
  'https://drive.google.com/thumbnail?id=1pN1YUxcXCnUVE-he711_6KYcIJcSxMNV&sz=w400',
  '1pN1YUxcXCnUVE-he711_6KYcIJcSxMNV',
  'custom_made', 'active', ARRAY[]::text[], ARRAY[]::text[], ARRAY['docx']::text[], 1,
  (SELECT id FROM categories WHERE name = 'Durvis' AND parent_id IS NULL LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Pivot durvis' AND parent_id IS NOT NULL LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM drawings WHERE drive_file_id = '1pN1YUxcXCnUVE-he711_6KYcIJcSxMNV');

-- ✅ Gatavs! Pēc palaišanas visi 33 faili parādīsies katalogā ar Google Drive thumbnail preview.