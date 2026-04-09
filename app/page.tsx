'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase-client';
import Link from 'next/link';

// ── Labels (LV) ────────────────────────────────────────────────────────────
const L = {
  type: { purchasable: 'Pērkams', custom_made: 'Izgatavojams', mixed: 'Jaukts' } as Record<string,string>,
  status: { active: 'Aktīvs', draft: 'Melnraksts', archived: 'Arhivēts' } as Record<string,string>,
  pstatus: { conceptual: 'Konceptuāls', sd: 'SD', dd: 'DD', cd: 'CD', construction: 'Būvniecībā', completed: 'Pabeigts', on_hold: 'Apturēts' } as Record<string,string>,
  office: { lv: 'LV', es: 'ES', uae: 'UAE' } as Record<string,string>,
  price: { budget: '< €500', mid: '€500–2k', premium: '€2k–5k', luxury: '> €5k' } as Record<string,string>,
};
const DEFAULT_MATERIALS = ['Koks','Metāls','Stikls','Audums','Āda','Keramika','Akmens','Betons'];
const DEFAULT_FINISHES = ['Matēts','Lakots','Pulēts','Krāsots','Dabīgs','Anodēts','Smilšstrūkl.'];

// ── SVG Drawing generators ─────────────────────────────────────────────────
function hash(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h); }

function Thumb({ name, id, w = 155, thumbnailUrl, driveFileId }: { name: string; id: string; w?: number; thumbnailUrl?: string | null; driveFileId?: string | null }) {
  const h = hash(id); const hue = h % 360;
  // Use real thumbnail if available
  const imgSrc = thumbnailUrl || (driveFileId ? `https://drive.google.com/thumbnail?id=${driveFileId}&sz=w${w * 2}` : null);
  const [imgErr, setImgErr] = useState(false);

  if (imgSrc && !imgErr) {
    return (
      <div style={{ width: w, height: w * 1.414 }} className="block rounded-sm bg-gray-100 overflow-hidden relative">
        <img src={imgSrc} alt={name} onError={() => setImgErr(true)}
          className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-1.5 pb-1 pt-3">
          <div className="text-[9px] text-white font-mono leading-tight truncate">{(name||'').slice(0,22)}</div>
        </div>
      </div>
    );
  }

  return (
    <svg width={w} height={w * 1.414} viewBox="0 0 150 212" className="block rounded-sm">
      <rect width="150" height="212" fill={`hsl(${hue},6%,95%)`} />
      <rect x="8" y="8" width="134" height="196" fill="none" stroke={`hsl(${hue},12%,80%)`} strokeWidth=".5" />
      <rect x={20+(h%20)} y={30+(h%15)} width={60+(h%40)} height={35+(h%25)} fill="none" stroke={`hsl(${hue},25%,55%)`} strokeWidth=".9" />
      <rect x={35+(h%15)} y={50+(h%10)} width={25+(h%20)} height={18+(h%12)} fill={`hsl(${hue},10%,90%)`} stroke={`hsl(${hue},20%,65%)`} strokeWidth=".5" />
      <circle cx={100+(h%20)} cy={55+(h%25)} r={10+(h%8)} fill="none" stroke={`hsl(${hue},20%,60%)`} strokeWidth=".6" />
      <rect x="85" y="175" width="57" height="29" fill="rgba(255,255,255,.85)" stroke={`hsl(${hue},20%,65%)`} strokeWidth=".5" />
      <text x="90" y="185" fontSize="5" fontWeight="700" fill={`hsl(${hue},25%,35%)`} fontFamily="monospace">OAD</text>
      <text x="90" y="199" fontSize="3" fill="#aaa" fontFamily="monospace">{(name||'').slice(0,18)}</text>
    </svg>
  );
}

function FullPDF({ name, id, page = 1, pages = 3, scale = 1 }: { name: string; id: string; page?: number; pages?: number; scale?: number }) {
  const h = hash(id); const hue = h % 360;
  return (
    <svg width={595 * scale} height={842 * scale} viewBox="0 0 595 842" className="block" style={{ background: `hsl(${hue},6%,96%)` }}>
      {Array.from({ length: 25 }, (_, i) => <line key={`h${i}`} x1="0" y1={i*35} x2="595" y2={i*35} stroke={`hsl(${hue},8%,90%)`} strokeWidth=".3" />)}
      {Array.from({ length: 18 }, (_, i) => <line key={`v${i}`} x1={i*35} y1="0" x2={i*35} y2="842" stroke={`hsl(${hue},8%,90%)`} strokeWidth=".3" />)}
      <rect x="20" y="20" width="555" height="802" fill="none" stroke={`hsl(${hue},12%,72%)`} strokeWidth="1" />
      <rect x={80+(h%40)} y={100+(h%30)} width={200+(h%100)} height={120+(h%60)} fill="none" stroke={`hsl(${hue},28%,48%)`} strokeWidth="1.5" />
      <rect x={120+(h%30)} y={140+(h%20)} width={80+(h%50)} height={50+(h%30)} fill={`hsl(${hue},10%,92%)`} stroke={`hsl(${hue},22%,58%)`} strokeWidth=".8" />
      <circle cx={350+(h%80)} cy={160+(h%60)} r={35+(h%20)} fill="none" stroke={`hsl(${hue},22%,55%)`} strokeWidth="1" />
      <line x1="60" y1={260+(h%40)} x2="540" y2={260+(h%40)} stroke={`hsl(${hue},15%,75%)`} strokeWidth=".5" strokeDasharray="6 3" />
      <text x="50" y="160" fill="#999" fontSize="8" textAnchor="middle" transform="rotate(-90,50,160)">{1200+h%2000} mm</text>
      {page > 1 && <>
        <rect x="100" y="380" width="400" height="200" fill="none" stroke={`hsl(${hue},25%,50%)`} strokeWidth="1" />
        <text x="300" y="600" textAnchor="middle" fill="#aaa" fontSize="10" fontFamily="monospace">SECTION {page > 2 ? 'B-B' : 'A-A'}</text>
      </>}
      <rect x="370" y="780" width="205" height="42" fill="rgba(255,255,255,.9)" stroke={`hsl(${hue},20%,55%)`} strokeWidth="1" />
      <text x="380" y="792" fontSize="11" fontWeight="700" fill={`hsl(${hue},25%,30%)`} fontFamily="monospace">OAD</text>
      <text x="380" y="808" fontSize="7" fill="#888" fontFamily="monospace">{name}</text>
      <text x="380" y="818" fontSize="6" fill="#aaa" fontFamily="monospace">Lapa {page}/{pages} · M 1:50</text>
    </svg>
  );
}

// ── Tiny components ────────────────────────────────────────────────────────
function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs border transition-all cursor-pointer ${active ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}>
      {label}
    </button>
  );
}

function InfoRow({ label, value, accent }: { label: string; value?: string | number | null; accent?: boolean }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between py-1.5 border-b border-gray-100 text-[13px] gap-3">
      <span className="text-gray-400 shrink-0">{label}</span>
      <span className={`text-right ${accent ? 'font-bold text-blue-600' : 'font-medium'}`}>{value}</span>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function CatalogPage() {
  // Reference data
  const [categories, setCats] = useState<any[]>([]);
  const [manufacturers, setMfrs] = useState<any[]>([]);
  const [dealers, setDlrs] = useState<any[]>([]);
  const [projects, setProjs] = useState<any[]>([]);
  const [refLoading, setRefLoading] = useState(true);
  const [refErr, setRefErr] = useState('');

  // Drawings
  const [drawings, setDrawings] = useState<any[]>([]);
  const [dLoading, setDLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [fCat, setFCat] = useState('');
  const [fSubcat, setFSubcat] = useState('');
  const [fType, setFType] = useState('');
  const [fMfr, setFMfr] = useState('');
  const [fDlr, setFDlr] = useState('');
  const [fMat, setFMat] = useState('');
  const [fFin, setFFin] = useState('');
  const [fPrice, setFPrice] = useState('');
  const [fStatus, setFStatus] = useState('active');

  // Detail
  const [selId, setSelId] = useState<string | null>(null);
  const [selDrw, setSelDrw] = useState<any>(null);
  const [similar, setSimilar] = useState<any[]>([]);
  const [showSim, setShowSim] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [pdfPage, setPdfPage] = useState(1);
  const [pdfZoom, setPdfZoom] = useState(0.7);
  const [showFilters, setShowFilters] = useState(true);

  // Dynamic lookups
  const [MATERIALS, setMaterials] = useState<string[]>(DEFAULT_MATERIALS);
  const [FINISHES, setFinishes] = useState<string[]>(DEFAULT_FINISHES);

  // Add form
  const [addOpen, setAddOpen] = useState(false);
  const [newDrw, setNewDrw] = useState({ name: '', category_id: '', subcategory_id: '', drawing_type: 'purchasable', manufacturer_id: '', price: '', materials: [] as string[], file_url: '' });
  const [saving, setSaving] = useState(false);

  // Edit form
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [editSaving, setEditSaving] = useState(false);

  // Category materials filter
  const [catMaterials, setCatMaterials] = useState<Record<string, string[]>>({});
  const [catFinishes, setCatFinishes] = useState<Record<string, string[]>>({});

  // ── Load reference data ────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('manufacturers').select('*').order('name'),
      supabase.from('dealers').select('*').order('name'),
      supabase.from('projects').select('*').order('name'),
      supabase.from('lookup_values').select('*').eq('category', 'material').order('sort_order'),
      supabase.from('lookup_values').select('*').eq('category', 'finish').order('sort_order'),
      supabase.from('category_materials').select('*'),
      supabase.from('category_finishes').select('*'),
    ]).then(([c, m, d, p, mats, fins, catMats, catFins]) => {
      if (c.error || m.error || d.error || p.error) {
        setRefErr(c.error?.message || m.error?.message || d.error?.message || p.error?.message || 'Unknown error');
      } else {
        setCats(c.data || []);
        setMfrs(m.data || []);
        setDlrs(d.data || []);
        setProjs(p.data || []);
        if (mats.data && mats.data.length > 0) setMaterials(mats.data.map((v: any) => v.value));
        if (fins.data && fins.data.length > 0) setFinishes(fins.data.map((v: any) => v.value));
        // category_materials — group by category_id (graceful if table missing)
        if (catMats.data && catMats.data.length > 0) {
          const grouped: Record<string, string[]> = {};
          catMats.data.forEach((row: any) => {
            if (!grouped[row.category_id]) grouped[row.category_id] = [];
            grouped[row.category_id].push(row.material);
          });
          setCatMaterials(grouped);
        }
        if (catFins.data && catFins.data.length > 0) {
          const grouped: Record<string, string[]> = {};
          catFins.data.forEach((row: any) => {
            if (!grouped[row.category_id]) grouped[row.category_id] = [];
            grouped[row.category_id].push(row.finish);
          });
          setCatFinishes(grouped);
        }
      }
      setRefLoading(false);
    });
  }, []);

  const parentCats = useMemo(() => categories.filter(c => !c.parent_id), [categories]);
  const subcats = useMemo(() => fCat ? categories.filter(c => c.parent_id === fCat) : [], [categories, fCat]);

  // Filtered materials/finishes based on selected category (or edit form category)
  const visibleMaterials = useMemo(() => {
    const catId = fCat;
    if (catId && catMaterials[catId] && catMaterials[catId].length > 0) return MATERIALS.filter(m => catMaterials[catId].includes(m));
    return MATERIALS;
  }, [fCat, catMaterials, MATERIALS]);

  const visibleFinishes = useMemo(() => {
    const catId = fCat;
    if (catId && catFinishes[catId] && catFinishes[catId].length > 0) return FINISHES.filter(f => catFinishes[catId].includes(f));
    return FINISHES;
  }, [fCat, catFinishes, FINISHES]);

  const editVisibleMaterials = useMemo(() => {
    const catId = editForm.category_id;
    if (catId && catMaterials[catId] && catMaterials[catId].length > 0) return MATERIALS.filter(m => catMaterials[catId].includes(m));
    return MATERIALS;
  }, [editForm.category_id, catMaterials, MATERIALS]);

  const editVisibleFinishes = useMemo(() => {
    const catId = editForm.category_id;
    if (catId && catFinishes[catId] && catFinishes[catId].length > 0) return FINISHES.filter(f => catFinishes[catId].includes(f));
    return FINISHES;
  }, [editForm.category_id, catFinishes, FINISHES]);

  const newDrwVisibleMaterials = useMemo(() => {
    const catId = newDrw.category_id;
    if (catId && catMaterials[catId] && catMaterials[catId].length > 0) return MATERIALS.filter(m => catMaterials[catId].includes(m));
    return MATERIALS;
  }, [newDrw.category_id, catMaterials, MATERIALS]);

  // ── Load drawings ──────────────────────────────────────────────────
  const loadDrawings = useCallback(async () => {
    setDLoading(true);
    let q = supabase.from('drawings').select(`
      *, 
      categories!drawings_category_id_fkey(name,slug),
      subcategory:categories!drawings_subcategory_id_fkey(name,slug),
      manufacturers(name),
      dealers(name)
    `);
    if (fStatus) q = q.eq('status', fStatus);
    if (fCat) q = q.eq('category_id', fCat);
    if (fSubcat) q = q.eq('subcategory_id', fSubcat);
    if (fType) q = q.eq('drawing_type', fType);
    if (fMfr) q = q.eq('manufacturer_id', fMfr);
    if (fDlr) q = q.eq('dealer_id', fDlr);
    if (fPrice) q = q.eq('price_range', fPrice);
    if (fMat) q = q.contains('materials', [fMat]);
    if (fFin) q = q.contains('finishes', [fFin]);
    if (search) q = q.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    q = q.order('created_at', { ascending: false });
    const { data } = await q;
    setDrawings(data || []);
    setDLoading(false);
  }, [search, fCat, fSubcat, fType, fMfr, fDlr, fMat, fFin, fPrice, fStatus]);

  useEffect(() => { if (!refLoading) loadDrawings(); }, [loadDrawings, refLoading]);

  // ── Load detail ────────────────────────────────────────────────────
  useEffect(() => {
    if (!selId) { setSelDrw(null); setSimilar([]); setEditing(false); return; }
    setEditing(false);
    (async () => {
      const { data } = await supabase.from('drawings').select(`
        *,
        categories!drawings_category_id_fkey(name,slug),
        subcategory:categories!drawings_subcategory_id_fkey(name,slug),
        manufacturers(name),
        dealers(name),
        drawing_projects(project_id, projects(id,name,status,location)),
        drawing_assignees(profile_id, profiles(id,full_name,job_title,office))
      `).eq('id', selId).single();
      setSelDrw(data);
      setPdfPage(1);
      setShowSim(false);
      // Similar
      const { data: sim } = await supabase.rpc('find_similar_drawings', { drawing_uuid: selId, max_results: 6 });
      setSimilar(sim || []);
    })();
  }, [selId]);

  // ── Save new drawing ───────────────────────────────────────────────
  const saveDrawing = async () => {
    if (!newDrw.name.trim()) return;
    setSaving(true);
    const payload: any = {
      name: newDrw.name,
      drawing_type: newDrw.drawing_type,
      status: 'active',
      materials: newDrw.materials,
      finishes: [],
      tags: [],
      page_count: 1 + Math.floor(Math.random() * 4),
    };
    if (newDrw.category_id) payload.category_id = newDrw.category_id;
    if (newDrw.subcategory_id) payload.subcategory_id = newDrw.subcategory_id;
    if (newDrw.manufacturer_id) payload.manufacturer_id = newDrw.manufacturer_id;
    if (newDrw.price) payload.price = parseFloat(newDrw.price);
    if (newDrw.file_url) payload.file_url = newDrw.file_url;
    const { error } = await supabase.from('drawings').insert(payload);
    if (error) alert('Kļūda: ' + error.message);
    else {
      setAddOpen(false);
      setNewDrw({ name: '', category_id: '', subcategory_id: '', drawing_type: 'purchasable', manufacturer_id: '', price: '', materials: [], file_url: '' });
      loadDrawings();
    }
    setSaving(false);
  };

  // ── Keyboard ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!fullscreen) return;
    const fn = (e: KeyboardEvent) => {
      const pg = selDrw?.page_count || 3;
      if (e.key === 'Escape') setFullscreen(false);
      if (e.key === 'ArrowRight' && pdfPage < pg) setPdfPage(p => p + 1);
      if (e.key === 'ArrowLeft' && pdfPage > 1) setPdfPage(p => p - 1);
      if (e.key === '+' || e.key === '=') setPdfZoom(z => Math.min(1.8, z + 0.15));
      if (e.key === '-') setPdfZoom(z => Math.max(0.3, z - 0.15));
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [fullscreen, pdfPage, selDrw]);

  const activeFilters = [fCat, fSubcat, fType, fMfr, fDlr, fMat, fFin, fPrice, fStatus].filter(Boolean).length;
  const clearAll = () => { setSearch(''); setFCat(''); setFSubcat(''); setFType(''); setFMfr(''); setFDlr(''); setFMat(''); setFFin(''); setFPrice(''); setFStatus(''); };

  // ══════════════════════════════════════════════════════════════════════
  // RENDER — Fullscreen PDF / Drive
  // ══════════════════════════════════════════════════════════════════════
  if (fullscreen && selDrw) {
    const pg = selDrw.page_count || 3;
    const hasDrive = !!selDrw.drive_file_id;
    const hasFileUrl = !!selDrw.file_url;
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-[#1a1a1a]">
        <div className="h-12 bg-[#111] flex items-center justify-between px-4 border-b border-[#333] shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setFullscreen(false)} className="text-gray-400 hover:text-white text-lg px-2">✕</button>
            <span className="text-gray-200 text-sm font-medium">{selDrw.name}</span>
            <span className="text-gray-500 text-xs font-mono">{selDrw.manufacturers?.name}</span>
          </div>
          {!hasDrive ? (
            <div className="flex items-center gap-1.5">
              <button onClick={() => setPdfZoom(z => Math.max(0.3, z - 0.15))} className="w-7 h-7 bg-[#333] border border-[#555] rounded text-gray-300 flex items-center justify-center text-sm">−</button>
              <span className="text-gray-400 text-xs font-mono w-11 text-center">{Math.round(pdfZoom * 100)}%</span>
              <button onClick={() => setPdfZoom(z => Math.min(1.8, z + 0.15))} className="w-7 h-7 bg-[#333] border border-[#555] rounded text-gray-300 flex items-center justify-center text-sm">+</button>
              <span className="text-[#444] mx-1">│</span>
              <button onClick={() => setPdfPage(p => Math.max(1, p - 1))} disabled={pdfPage <= 1} className="w-7 h-7 bg-[#333] border border-[#555] rounded text-gray-300 flex items-center justify-center text-xs disabled:opacity-30">◀</button>
              <span className="text-gray-400 text-xs font-mono">{pdfPage}/{pg}</span>
              <button onClick={() => setPdfPage(p => Math.min(pg, p + 1))} disabled={pdfPage >= pg} className="w-7 h-7 bg-[#333] border border-[#555] rounded text-gray-300 flex items-center justify-center text-xs disabled:opacity-30">▶</button>
              <span className="text-[#444] mx-1">│</span>
              <button onClick={() => setPdfZoom(0.7)} className="w-7 h-7 bg-[#333] border border-[#555] rounded text-gray-300 flex items-center justify-center text-[11px]">Fit</button>
            </div>
          ) : hasFileUrl ? (
            <a href={selDrw.file_url} target="_blank" rel="noreferrer" className="text-xs text-gray-400 hover:text-white px-3 py-1.5 bg-[#333] border border-[#555] rounded transition">Atvērt Drive ↗</a>
          ) : null}
        </div>
        <div className="flex-1 overflow-hidden flex bg-[#252525]">
          {hasDrive ? (
            <iframe
              src={`https://drive.google.com/file/d/${selDrw.drive_file_id}/preview`}
              className="w-full h-full border-0"
              allow="autoplay"
            />
          ) : hasFileUrl ? (
            <div className="flex flex-col items-center justify-center w-full h-full gap-5 overflow-auto p-8">
              <div className="shadow-2xl"><FullPDF name={selDrw.name} id={selDrw.id} page={pdfPage} pages={pg} scale={pdfZoom} /></div>
              <a href={selDrw.file_url} target="_blank" rel="noreferrer" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition">Atvērt Google Drive ↗</a>
            </div>
          ) : (
            <div className="overflow-auto flex justify-center items-start p-8 w-full">
              <div className="shadow-2xl"><FullPDF name={selDrw.name} id={selDrw.id} page={pdfPage} pages={pg} scale={pdfZoom} /></div>
            </div>
          )}
        </div>
        {!hasDrive && pg > 1 && <div className="h-16 bg-[#111] border-t border-[#333] flex items-center justify-center gap-1.5 shrink-0">
          {Array.from({ length: pg }, (_, i) => (
            <button key={i} onClick={() => setPdfPage(i + 1)} className={`w-8 h-11 rounded text-xs font-mono flex items-center justify-center border-2 ${pdfPage === i + 1 ? 'border-blue-500 bg-[#2a2a2a] text-white' : 'border-[#444] bg-[#1a1a1a] text-gray-500'}`}>{i + 1}</button>
          ))}
        </div>}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // RENDER — Loading / Error
  // ══════════════════════════════════════════════════════════════════════
  if (refLoading) return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><div className="w-6 h-6 border-[3px] border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto" /><p className="text-gray-400 text-sm mt-3">Savienojas ar Supabase...</p></div></div>;
  if (refErr) return <div className="min-h-screen flex items-center justify-center p-6"><div className="text-center max-w-md"><div className="text-4xl mb-2">⚠</div><h2 className="text-lg font-bold mb-2">Savienojuma kļūda</h2><pre className="text-xs text-red-600 bg-red-50 p-3 rounded-lg text-left overflow-auto">{refErr}</pre></div></div>;

  // ══════════════════════════════════════════════════════════════════════
  // RENDER — Main
  // ══════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-5 py-2.5 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3.5">
          <div className="w-8 h-8 bg-[#1a1a1a] rounded-md flex items-center justify-center text-white text-[10px] font-bold tracking-wider font-mono">OAD</div>
          <div>
            <h1 className="text-[15px] font-bold tracking-tight leading-none">Rasējumu Katalogs</h1>
            <span className="text-[10.5px] text-gray-400">{categories.length} kategorijas · {manufacturers.length} ražotāji · {projects.length} projekti</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 font-mono">{dLoading ? '...' : `${drawings.length} rasēj.`}</span>
          <Link href="/admin" className="text-xs text-gray-400 hover:text-gray-600 font-medium px-2 py-1.5 rounded border border-gray-200 hover:border-gray-300 transition">⚙ Admin</Link>
          <button onClick={() => setAddOpen(true)} className="bg-[#1a1a1a] text-white text-xs font-semibold px-3.5 py-1.5 rounded-md hover:bg-black transition">+ Pievienot</button>
        </div>
      </header>

      <div className="flex" style={{ minHeight: 'calc(100vh - 48px)' }}>
        {/* ── Filters ─────────────────────────────────────────────── */}
        {showFilters && (
          <aside className="w-[268px] bg-white border-r border-gray-200 overflow-y-auto shrink-0">
            <div className="p-3.5">
              <div className="relative mb-3">
                <input type="text" placeholder="Meklēt nosaukumā..." value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 border border-gray-200 rounded-md text-[12.5px] outline-none bg-[#fafaf9] focus:border-blue-400" />
                <span className="absolute left-2 top-2 text-gray-300 text-sm">⌕</span>
              </div>

              {activeFilters > 0 && (
                <div className="flex items-center justify-between mb-2.5 px-2 py-1 bg-blue-50 rounded text-[11.5px]">
                  <span className="text-blue-700 font-medium">{activeFilters} aktīvi filtri</span>
                  <button onClick={clearAll} className="text-blue-600 underline">Notīrīt</button>
                </div>
              )}

              {/* Status */}
              <Section title="Statuss">
                <div className="flex flex-wrap gap-1">{Object.entries(L.status).map(([k, v]) => <Chip key={k} label={v} active={fStatus === k} onClick={() => setFStatus(fStatus === k ? '' : k)} />)}</div>
              </Section>

              {/* Category */}
              <Section title="Kategorija">
                <div className="flex flex-wrap gap-1">{parentCats.map(c => <Chip key={c.id} label={c.name} active={fCat === c.id} onClick={() => { setFCat(fCat === c.id ? '' : c.id); setFSubcat(''); }} />)}</div>
              </Section>

              {subcats.length > 0 && <Section title="Apakškategorija">
                <div className="flex flex-wrap gap-1">{subcats.map(c => <Chip key={c.id} label={c.name} active={fSubcat === c.id} onClick={() => setFSubcat(fSubcat === c.id ? '' : c.id)} />)}</div>
              </Section>}

              <Section title="Tips">
                <div className="flex flex-wrap gap-1">{Object.entries(L.type).map(([k, v]) => <Chip key={k} label={v} active={fType === k} onClick={() => setFType(fType === k ? '' : k)} />)}</div>
              </Section>

              <Section title="Ražotājs">
                <select value={fMfr} onChange={e => setFMfr(e.target.value)} className="w-full p-1.5 border border-gray-200 rounded text-xs bg-[#fafaf9]">
                  <option value="">Visi</option>
                  {manufacturers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </Section>

              <Section title="Dīleris">
                <select value={fDlr} onChange={e => setFDlr(e.target.value)} className="w-full p-1.5 border border-gray-200 rounded text-xs bg-[#fafaf9]">
                  <option value="">Visi</option>
                  {dealers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </Section>

              <Section title="Materiāls"><div className="flex flex-wrap gap-1">{visibleMaterials.map(m => <Chip key={m} label={m} active={fMat === m} onClick={() => setFMat(fMat === m ? '' : m)} />)}</div></Section>
              <Section title="Apdare"><div className="flex flex-wrap gap-1">{visibleFinishes.map(f => <Chip key={f} label={f} active={fFin === f} onClick={() => setFFin(fFin === f ? '' : f)} />)}</div></Section>
              <Section title="Cenu diapazons"><div className="flex flex-wrap gap-1">{Object.entries(L.price).map(([k, v]) => <Chip key={k} label={v} active={fPrice === k} onClick={() => setFPrice(fPrice === k ? '' : k)} />)}</div></Section>
            </div>
          </aside>
        )}

        {/* ── Main ────────────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col min-w-0">
          <div className="px-4 py-1.5 bg-white border-b border-gray-100 flex items-center gap-2">
            <button onClick={() => setShowFilters(!showFilters)} className={`text-[11.5px] px-2.5 py-1 border rounded ${showFilters ? 'bg-gray-100 border-gray-200' : 'border-gray-200'} text-gray-500`}>☰ Filtri</button>
            {selId && <button onClick={() => setSelId(null)} className="text-[11.5px] px-2.5 py-1 bg-red-50 border border-red-200 rounded text-red-600">← Galerija</button>}
          </div>

          {!selId ? (
            /* Gallery */
            <div className="p-4 overflow-auto flex-1">
              {dLoading ? <div className="flex justify-center py-12"><div className="w-5 h-5 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" /></div> :
                drawings.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <div className="text-4xl mb-2">∅</div>
                    <div className="text-sm font-medium">Nav rasējumu</div>
                    <div className="text-xs mt-1">Pievieno pirmo ar "+ Pievienot"</div>
                  </div>
                ) : (
                  <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))' }}>
                    {drawings.map(d => (
                      <div key={d.id} onClick={() => setSelId(d.id)} className="cursor-pointer group">
                        <div className="rounded overflow-hidden border border-gray-200 bg-white group-hover:shadow-md transition-shadow">
                          <Thumb name={d.name} id={d.id} thumbnailUrl={d.thumbnail_url} driveFileId={d.drive_file_id} />
                        </div>
                        <div className="pt-1 px-0.5">
                          <div className="text-[11.5px] font-semibold leading-tight truncate">{d.name}</div>
                          <div className="text-[10.5px] text-gray-400 mt-0.5">{d.manufacturers?.name || '—'} {d.price ? `· €${Number(d.price).toLocaleString()}` : ''}</div>
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {d.categories?.name && <span className="px-1.5 py-px bg-gray-100 rounded text-[9.5px] text-gray-500">{d.categories.name}</span>}
                            <span className="px-1.5 py-px bg-gray-100 rounded text-[9.5px] text-gray-500">{L.type[d.drawing_type]}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          ) : (
            /* Detail */
            !selDrw ? <div className="flex justify-center py-12"><div className="w-5 h-5 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" /></div> : (
              <div className="flex flex-1 overflow-hidden">
                {/* PDF / Drive preview */}
                <div className="flex-1 bg-[#e8e7e4] flex flex-col items-center justify-center p-5 overflow-auto">
                  {selDrw.drive_file_id ? (
                    <div className="flex flex-col items-center gap-3 w-full">
                      <div onClick={() => { setFullscreen(true); setPdfZoom(0.7); }} className="cursor-zoom-in shadow-xl relative max-w-xs w-full">
                        <img
                          src={`https://drive.google.com/thumbnail?id=${selDrw.drive_file_id}&sz=w800`}
                          alt={selDrw.name}
                          className="w-full rounded object-contain bg-white"
                        />
                        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 bg-black/70 text-white px-2.5 py-1 rounded text-[10.5px] flex items-center gap-1.5">🔍 Pilnekrāna skats</div>
                      </div>
                      {selDrw.file_url && (
                        <a href={selDrw.file_url} target="_blank" rel="noreferrer"
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition">
                          Atvērt Drive ↗
                        </a>
                      )}
                    </div>
                  ) : (
                    <>
                      <div onClick={() => { setFullscreen(true); setPdfZoom(0.7); }} className="cursor-zoom-in shadow-xl relative">
                        <FullPDF name={selDrw.name} id={selDrw.id} page={pdfPage} pages={selDrw.page_count || 3} scale={0.55} />
                        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 bg-black/70 text-white px-2.5 py-1 rounded text-[10.5px] flex items-center gap-1.5">🔍 Pilnekrāna skats</div>
                      </div>
                      {selDrw.file_url && (
                        <a href={selDrw.file_url} target="_blank" rel="noreferrer"
                          className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition">
                          Atvērt Drive ↗
                        </a>
                      )}
                      {(selDrw.page_count || 3) > 1 && (
                        <div className="flex gap-2 mt-3 items-center">
                          <button onClick={() => setPdfPage(p => Math.max(1, p - 1))} disabled={pdfPage <= 1} className="w-6 h-6 bg-white border border-gray-300 rounded text-xs flex items-center justify-center disabled:opacity-30">◀</button>
                          <span className="text-xs font-mono text-gray-500">{pdfPage}/{selDrw.page_count || 3}</span>
                          <button onClick={() => setPdfPage(p => Math.min(selDrw.page_count || 3, p + 1))} disabled={pdfPage >= (selDrw.page_count || 3)} className="w-6 h-6 bg-white border border-gray-300 rounded text-xs flex items-center justify-center disabled:opacity-30">▶</button>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Info */}
                <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto p-4 shrink-0">
                  {/* Header row with edit button */}
                  <div className="flex items-start justify-between mb-0.5 gap-2">
                    <h2 className="text-[17px] font-bold leading-snug flex-1">{selDrw.name}</h2>
                    {!editing && (
                      <button
                        onClick={() => {
                          setEditing(true);
                          setEditForm({
                            name: selDrw.name || '',
                            category_id: selDrw.category_id || '',
                            subcategory_id: selDrw.subcategory_id || '',
                            drawing_type: selDrw.drawing_type || 'purchasable',
                            manufacturer_id: selDrw.manufacturer_id || '',
                            dealer_id: selDrw.dealer_id || '',
                            materials: selDrw.materials || [],
                            finishes: selDrw.finishes || [],
                            price: selDrw.price != null ? String(selDrw.price) : '',
                            status: selDrw.status || 'active',
                          });
                        }}
                        className="text-[11px] px-2 py-1 border border-gray-200 rounded text-gray-500 hover:border-blue-400 hover:text-blue-600 transition shrink-0"
                      >✎ Labot</button>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-400 font-mono mb-4">{selDrw.id.slice(0, 8)}… · {new Date(selDrw.created_at).toLocaleDateString('lv')}</div>

                  {!editing ? (
                    // View mode
                    <>
                      <InfoRow label="Kategorija" value={[selDrw.categories?.name, selDrw.subcategory?.name].filter(Boolean).join(' → ') || '—'} />
                      <InfoRow label="Tips" value={L.type[selDrw.drawing_type]} />
                      <InfoRow label="Ražotājs" value={selDrw.manufacturers?.name} />
                      <InfoRow label="Dīleris" value={selDrw.dealers?.name} />
                      <InfoRow label="Materiāli" value={selDrw.materials?.length ? selDrw.materials.join(', ') : null} />
                      <InfoRow label="Apdare" value={selDrw.finishes?.length ? selDrw.finishes.join(', ') : null} />
                      <InfoRow label="Cena" value={selDrw.price ? `€${Number(selDrw.price).toLocaleString()}` : null} accent />
                      <InfoRow label="Cenu grupa" value={selDrw.price_range ? L.price[selDrw.price_range] : null} />
                      <InfoRow label="Statuss" value={L.status[selDrw.status]} />
                      {selDrw.file_url && <a href={selDrw.file_url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 mt-2 inline-block">Atvērt oriģinālu ↗</a>}
                    </>
                  ) : (
                    // Edit mode
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-400 mb-0.5">Nosaukums</label>
                        <input value={editForm.name} onChange={e => setEditForm((f: any) => ({ ...f, name: e.target.value }))}
                          className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm outline-none focus:border-blue-400 bg-[#fafaf9]" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-400 mb-0.5">Kategorija</label>
                        <select value={editForm.category_id} onChange={e => setEditForm((f: any) => ({ ...f, category_id: e.target.value, subcategory_id: '' }))}
                          className="w-full p-1.5 border border-gray-200 rounded text-xs bg-[#fafaf9]">
                          <option value="">—</option>
                          {parentCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      {editForm.category_id && (
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-400 mb-0.5">Apakškategorija</label>
                          <select value={editForm.subcategory_id} onChange={e => setEditForm((f: any) => ({ ...f, subcategory_id: e.target.value }))}
                            className="w-full p-1.5 border border-gray-200 rounded text-xs bg-[#fafaf9]">
                            <option value="">—</option>
                            {categories.filter(c => c.parent_id === editForm.category_id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </div>
                      )}
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-400 mb-0.5">Tips</label>
                        <select value={editForm.drawing_type} onChange={e => setEditForm((f: any) => ({ ...f, drawing_type: e.target.value }))}
                          className="w-full p-1.5 border border-gray-200 rounded text-xs bg-[#fafaf9]">
                          {Object.entries(L.type).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-400 mb-0.5">Ražotājs</label>
                        <select value={editForm.manufacturer_id} onChange={e => setEditForm((f: any) => ({ ...f, manufacturer_id: e.target.value }))}
                          className="w-full p-1.5 border border-gray-200 rounded text-xs bg-[#fafaf9]">
                          <option value="">—</option>
                          {manufacturers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-400 mb-0.5">Dīleris</label>
                        <select value={editForm.dealer_id} onChange={e => setEditForm((f: any) => ({ ...f, dealer_id: e.target.value }))}
                          className="w-full p-1.5 border border-gray-200 rounded text-xs bg-[#fafaf9]">
                          <option value="">—</option>
                          {dealers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-400 mb-1">Materiāli</label>
                        <div className="flex flex-wrap gap-1">
                          {editVisibleMaterials.map(m => (
                            <Chip key={m} label={m} active={editForm.materials?.includes(m)}
                              onClick={() => setEditForm((f: any) => ({ ...f, materials: f.materials?.includes(m) ? f.materials.filter((x: string) => x !== m) : [...(f.materials || []), m] }))} />
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-400 mb-1">Apdare</label>
                        <div className="flex flex-wrap gap-1">
                          {editVisibleFinishes.map(fin => (
                            <Chip key={fin} label={fin} active={editForm.finishes?.includes(fin)}
                              onClick={() => setEditForm((f: any) => ({ ...f, finishes: f.finishes?.includes(fin) ? f.finishes.filter((x: string) => x !== fin) : [...(f.finishes || []), fin] }))} />
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-400 mb-0.5">Cena (EUR)</label>
                        <input type="number" value={editForm.price} onChange={e => setEditForm((f: any) => ({ ...f, price: e.target.value }))}
                          className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm outline-none bg-[#fafaf9]" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-400 mb-0.5">Statuss</label>
                        <select value={editForm.status} onChange={e => setEditForm((f: any) => ({ ...f, status: e.target.value }))}
                          className="w-full p-1.5 border border-gray-200 rounded text-xs bg-[#fafaf9]">
                          {Object.entries(L.status).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          disabled={editSaving}
                          onClick={async () => {
                            setEditSaving(true);
                            const payload: any = {
                              name: editForm.name,
                              drawing_type: editForm.drawing_type,
                              status: editForm.status,
                              materials: editForm.materials || [],
                              finishes: editForm.finishes || [],
                              price: editForm.price ? parseFloat(editForm.price) : null,
                              category_id: editForm.category_id || null,
                              subcategory_id: editForm.subcategory_id || null,
                              manufacturer_id: editForm.manufacturer_id || null,
                              dealer_id: editForm.dealer_id || null,
                            };
                            const { error } = await supabase.from('drawings').update(payload).eq('id', selDrw.id);
                            if (error) { alert('Kļūda: ' + error.message); }
                            else {
                              setEditing(false);
                              const { data } = await supabase.from('drawings').select(`
                                *,
                                categories!drawings_category_id_fkey(name,slug),
                                subcategory:categories!drawings_subcategory_id_fkey(name,slug),
                                manufacturers(name),
                                dealers(name),
                                drawing_projects(project_id, projects(id,name,status,location)),
                                drawing_assignees(profile_id, profiles(id,full_name,job_title,office))
                              `).eq('id', selDrw.id).single();
                              setSelDrw(data);
                              loadDrawings();
                            }
                            setEditSaving(false);
                          }}
                          className="flex-1 bg-[#1a1a1a] text-white py-2 rounded-md text-xs font-semibold hover:bg-black transition disabled:opacity-40"
                        >{editSaving ? 'Saglabā...' : 'Saglabāt'}</button>
                        <button onClick={() => setEditing(false)} className="bg-gray-100 border border-gray-200 py-2 px-3 rounded-md text-xs hover:bg-gray-200 transition">Atcelt</button>
                      </div>
                    </div>
                  )}

                  {!editing && (
                    <>
                      {selDrw.drawing_projects?.length > 0 && (
                        <div className="border-t border-gray-100 mt-4 pt-3">
                          <h3 className="text-xs font-semibold text-gray-500 mb-1.5">Projekti</h3>
                          {selDrw.drawing_projects.map((dp: any) => dp.projects && (
                            <div key={dp.project_id} className="flex justify-between px-2 py-1 bg-gray-50 rounded text-[11.5px] mb-0.5">
                              <span className="font-medium">{dp.projects.name}</span>
                              <span className="text-gray-400">{L.office[dp.projects.location]} · {L.pstatus[dp.projects.status]}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {selDrw.drawing_assignees?.length > 0 && (
                        <div className="border-t border-gray-100 mt-4 pt-3">
                          <h3 className="text-xs font-semibold text-gray-500 mb-1.5">Atbildīgie</h3>
                          {selDrw.drawing_assignees.map((da: any) => da.profiles && (
                            <div key={da.profile_id} className="flex justify-between px-2 py-1 bg-gray-50 rounded text-[11.5px] mb-0.5">
                              <span className="font-medium">{da.profiles.full_name}</span>
                              <span className="text-gray-400">{da.profiles.job_title}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="border-t border-gray-100 mt-4 pt-3">
                        <button onClick={() => setShowSim(!showSim)} className={`w-full py-2 rounded-md text-xs font-semibold transition ${showSim ? 'bg-blue-600 text-white' : 'bg-gray-100 text-blue-600 hover:bg-gray-200'}`}>
                          {showSim ? 'Paslēpt līdzīgos' : `Līdzīgi rasējumi (${similar.length})`}
                        </button>
                        {showSim && similar.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 mt-2.5">
                            {similar.map(s => (
                              <div key={s.id} className="cursor-pointer" onClick={() => { setSelId(s.id); setShowSim(false); }}>
                                <div className="rounded overflow-hidden border border-gray-200"><Thumb name={s.name} id={s.id} w={120} thumbnailUrl={s.thumbnail_url} driveFileId={s.drive_file_id} /></div>
                                <div className="text-[10px] font-medium mt-0.5 leading-tight">{s.name}</div>
                                <div className="text-[9.5px] text-gray-400">{s.manufacturer_name} {s.price ? `· €${Number(s.price).toLocaleString()}` : ''}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )
          )}
        </main>
      </div>

      {/* ── Add Modal ─────────────────────────────────────────────── */}
      {addOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-5" onClick={e => { if (e.target === e.currentTarget) setAddOpen(false); }}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">Jauns rasējums</h2>
            <label className="block text-[11.5px] font-semibold text-gray-500 mt-2 mb-0.5">Nosaukums *</label>
            <input value={newDrw.name} onChange={e => setNewDrw({ ...newDrw, name: e.target.value })} className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-sm outline-none focus:border-blue-400 bg-[#fafaf9]" placeholder="Biroja krēsls Executive" />

            <label className="block text-[11.5px] font-semibold text-gray-500 mt-3 mb-0.5">Kategorija</label>
            <select value={newDrw.category_id} onChange={e => setNewDrw({ ...newDrw, category_id: e.target.value, subcategory_id: '' })} className="w-full p-1.5 border border-gray-200 rounded text-sm bg-[#fafaf9]">
              <option value="">—</option>
              {parentCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            {newDrw.category_id && <>
              <label className="block text-[11.5px] font-semibold text-gray-500 mt-3 mb-0.5">Apakškategorija</label>
              <select value={newDrw.subcategory_id} onChange={e => setNewDrw({ ...newDrw, subcategory_id: e.target.value })} className="w-full p-1.5 border border-gray-200 rounded text-sm bg-[#fafaf9]">
                <option value="">—</option>
                {categories.filter(c => c.parent_id === newDrw.category_id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </>}

            <label className="block text-[11.5px] font-semibold text-gray-500 mt-3 mb-0.5">Tips</label>
            <select value={newDrw.drawing_type} onChange={e => setNewDrw({ ...newDrw, drawing_type: e.target.value })} className="w-full p-1.5 border border-gray-200 rounded text-sm bg-[#fafaf9]">
              {Object.entries(L.type).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>

            <label className="block text-[11.5px] font-semibold text-gray-500 mt-3 mb-0.5">Ražotājs</label>
            <select value={newDrw.manufacturer_id} onChange={e => setNewDrw({ ...newDrw, manufacturer_id: e.target.value })} className="w-full p-1.5 border border-gray-200 rounded text-sm bg-[#fafaf9]">
              <option value="">—</option>
              {manufacturers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>

            <label className="block text-[11.5px] font-semibold text-gray-500 mt-3 mb-0.5">Cena (EUR)</label>
            <input type="number" value={newDrw.price} onChange={e => setNewDrw({ ...newDrw, price: e.target.value })} className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-sm outline-none bg-[#fafaf9]" placeholder="1200" />

            <label className="block text-[11.5px] font-semibold text-gray-500 mt-3 mb-1">Materiāli</label>
            <div className="flex flex-wrap gap-1 mb-3">
              {newDrwVisibleMaterials.map(m => <Chip key={m} label={m} active={newDrw.materials.includes(m)} onClick={() => setNewDrw(prev => ({ ...prev, materials: prev.materials.includes(m) ? prev.materials.filter(x => x !== m) : [...prev.materials, m] }))} />)}
            </div>

            <label className="block text-[11.5px] font-semibold text-gray-500 mt-1 mb-0.5">PDF URL (Google Drive / Dropbox)</label>
            <input value={newDrw.file_url} onChange={e => setNewDrw({ ...newDrw, file_url: e.target.value })} className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-sm outline-none bg-[#fafaf9]" placeholder="https://drive.google.com/file/d/..." />

            <div className="flex gap-2 mt-5">
              <button onClick={saveDrawing} disabled={saving || !newDrw.name.trim()} className="flex-1 bg-[#1a1a1a] text-white py-2.5 rounded-md text-sm font-semibold hover:bg-black transition disabled:opacity-40">
                {saving ? 'Saglabā...' : 'Saglabāt'}
              </button>
              <button onClick={() => setAddOpen(false)} className="bg-gray-100 border border-gray-200 py-2.5 px-4 rounded-md text-sm hover:bg-gray-200 transition">Atcelt</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <div className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wide mb-1">{title}</div>
      {children}
    </div>
  );
}
