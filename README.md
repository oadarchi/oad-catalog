# OAD Rasējumu Katalogs — Setup Guide

## Ātrais starts (15 min)

### 1. Supabase projekts

1. Ej uz [supabase.com](https://supabase.com) → New Project
2. Nosauc: `oad-drawing-catalog`
3. Izvēlies reģionu: **EU West** (tuvāk Rīgai)
4. Saglabā **Project URL** un **anon public key** → ieliec `.env.local`

### 2. Datubāze

SQL Editor → New Query → ielīmē visu `supabase/migrations/001_initial_schema.sql` → Run

Tas izveidos:
- 10 tabulas ar relācijām
- RLS politikas (viewer/editor/admin)
- Full-text search indeksus
- Automātiskus triggerus (price_range, updated_at, profila izveide)
- Seed datus (kategorijas, ražotāji, dīleri, projekti)

### 3. Auth konfigurācija

Supabase Dashboard → Authentication → Providers:
- **Email**: ieslēgt (priekš dev/testēšanas)
- **Google**: ieslēgt → ieliec Google OAuth Client ID/Secret
  - Google Cloud Console → APIs → Credentials → OAuth 2.0
  - Authorized redirect: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`

### 4. Frontend

```bash
cp .env.example .env.local
# Aizpildi ar saviem Supabase datiem

npm install
npm run dev
```

Atver http://localhost:3000

### 5. Deploy uz Vercel

```bash
# Instalē Vercel CLI
npm i -g vercel

# Deploy
vercel

# Konfigurē env variables Vercel dashboard
# NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
```

PWA automātiski strādās production build — lietotāji var "Add to Home Screen" telefonā.

---

## Projekta struktūra

```
oad-catalog/
├── public/
│   └── manifest.json              # PWA manifest (mobile install)
├── src/
│   ├── app/                       # Next.js App Router pages
│   │   ├── layout.tsx             # Root layout + auth provider
│   │   ├── page.tsx               # Main catalog page
│   │   ├── drawing/[id]/page.tsx  # Drawing detail page
│   │   └── auth/callback/route.ts # OAuth callback handler
│   ├── components/
│   │   ├── DrawingGallery.tsx     # Grid of drawing thumbnails
│   │   ├── DrawingDetail.tsx      # Full detail + PDF viewer
│   │   ├── FilterSidebar.tsx      # Multi-level filter panel
│   │   ├── PDFViewer.tsx          # PDF.js based viewer
│   │   ├── SimilarDrawings.tsx    # "Similar drawings" section
│   │   ├── SearchBar.tsx          # Universal search
│   │   └── Header.tsx             # App header + user menu
│   ├── lib/
│   │   ├── supabase.ts           # DB client + all queries
│   │   └── hooks.ts              # React hooks for data/auth/filters
│   └── types/
│       └── database.ts           # TypeScript types + labels
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql # Full DB schema + seed
├── .env.example                   # Environment template
├── next.config.js                 # Next.js + PWA config
└── package.json                   # Dependencies
```

---

## Datubāzes shēma (vizuāli)

```
profiles ─────────┐
  id (PK, FK→auth) │
  full_name         │
  role (enum)       │
  office (enum)     │
                    │
categories ────┐   │
  id (PK)      │   │
  name          │   │
  parent_id ◄──┘   │   (self-referencing hierarhija)
                    │
manufacturers ──┐  │
  id (PK)       │  │
  name           │  │
                 │  │
dealers ─────┐  │  │
  id (PK)    │  │  │
  regions[]  │  │  │
             │  │  │
projects ──┐ │  │  │
  id (PK)  │ │  │  │
  status    │ │  │  │
  location  │ │  │  │
            │ │  │  │
drawings ◄─┼─┼──┼──┤  (galvenā entītija)
  id (PK)  │ │  │  │
  ├── category_id ──────► categories
  ├── subcategory_id ───► categories
  ├── manufacturer_id ──► manufacturers
  ├── dealer_id ────────► dealers
  ├── materials[] (GIN)
  ├── finishes[] (GIN)
  ├── tags[] (GIN)
  ├── file_url
  └── thumbnail_url
            │ │     │
            │ │     │
drawing_projects ◄──┘  (many-to-many)
  drawing_id ──► drawings
  project_id ──► projects

drawing_assignees      (many-to-many)
  drawing_id ──► drawings
  profile_id ──► profiles
```

---

## RLS (Row Level Security) kopsavilkums

| Tabula | SELECT | INSERT | UPDATE | DELETE |
|--------|--------|--------|--------|--------|
| drawings | Visi | Editor+ | Editor+ | Tikai admin |
| projects | Visi | Editor+ | Editor+ | Tikai admin |
| categories | Visi | Tikai admin | Tikai admin | Tikai admin |
| manufacturers | Visi | Tikai admin | Tikai admin | Tikai admin |
| profiles | Visi | (auto) | Savs profils | Admin |

---

## Google Drive integrācija

### Kā tas strādā:

1. PDF faili paliek Google Drive (nav jākopē)
2. Katrs rasējuma ieraksts satur `file_url` — Drive share saiti
3. Aplikācija pārveido saiti uz embeddable preview URL
4. PDF.js renderē failu tieši no Drive

### URL konvertācija:

```
Share link:    https://drive.google.com/file/d/ABC123/view?usp=sharing
Preview embed: https://drive.google.com/file/d/ABC123/preview
Direct PDF:    https://drive.google.com/uc?export=download&id=ABC123
```

### Drive API (automātiskai sync):

```
OAD Shared Drive (0AHAtKfY-es1OUk9PVA)
└── Rasējumi/
    ├── Mēbeles/
    │   ├── Krēsli/
    │   │   └── Vitra_Office_Chair.pdf → category=Mēbeles, subcategory=Krēsli
    │   └── Galdi/
    ├── Apgaismojums/
    └── ...
```

Folderu struktūra automātiski mapējas uz kategorijām caur Make.com vai custom webhook.

---

## Nākamie soļi pēc MVP

### Fāze 2 (nedēļa 5–6):
- [ ] PDF.js pilnekrāna viewer ar zoom/navigāciju
- [ ] Thumbnail auto-ģenerēšana (Supabase Edge Function + pdf-img)
- [ ] Bulk import no CSV
- [ ] Admin panelis (lietotāju lomu pārvaldība)

### Fāze 3 (nedēļa 7–8):
- [ ] Make.com webhook: Drive folderu monitoring → auto-create drawings
- [ ] Offline mode (Service Worker cache + IndexedDB)
- [ ] Push notifications par jauniem rasējumiem projektā

### Fāze 4 (pēc MVP):
- [ ] Notion sync (divvirzienu caur Notion API)
- [ ] AI-powered meklēšana (embeddings + vector search)
- [ ] Rasējumu versiju vēsture
- [ ] Komentāri un anotācijas uz PDF
