'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase-client';
import Link from 'next/link';

// ── Types ─────────────────────────────────────────────────────────────────
interface Category { id: string; name: string; slug: string; parent_id: string | null; sort_order: number; }
interface Manufacturer { id: string; name: string; country?: string | null; website?: string | null; contact_email?: string | null; }
interface Dealer { id: string; name: string; country?: string | null; website?: string | null; contact_email?: string | null; }

type Tab = 'categories' | 'manufacturers' | 'dealers' | 'materials' | 'finishes' | 'types';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'categories', label: 'Kategorijas', icon: '📂' },
  { key: 'manufacturers', label: 'Ražotāji', icon: '🏭' },
  { key: 'dealers', label: 'Dīleri', icon: '🏪' },
  { key: 'materials', label: 'Materiāli', icon: '🪵' },
  { key: 'finishes', label: 'Apdares', icon: '✨' },
  { key: 'types', label: 'Tipi', icon: '📋' },
];

// ── Reusable components ───────────────────────────────────────────────────

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-5" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="block text-[11.5px] font-semibold text-gray-500 mb-0.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-sm outline-none focus:border-blue-400 bg-[#fafaf9]" />
  );
}

function ActionBtn({ onClick, label, variant = 'primary', disabled, small }: { onClick: () => void; label: string; variant?: 'primary' | 'danger' | 'secondary'; disabled?: boolean; small?: boolean }) {
  const cls = variant === 'primary'
    ? 'bg-[#1a1a1a] text-white hover:bg-black'
    : variant === 'danger'
    ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
    : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200';
  return (
    <button onClick={onClick} disabled={disabled}
      className={`${cls} rounded-md font-semibold transition disabled:opacity-40 ${small ? 'text-xs px-2.5 py-1' : 'text-sm px-4 py-2'}`}>
      {label}
    </button>
  );
}

function ConfirmDelete({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
      <span className="text-red-700 flex-1">Dzēst <b>{name}</b>?</span>
      <ActionBtn onClick={onConfirm} label="Jā, dzēst" variant="danger" small />
      <ActionBtn onClick={onCancel} label="Atcelt" variant="secondary" small />
    </div>
  );
}

function slugify(s: string): string {
  return s.toLowerCase()
    .replace(/[āa]/g, 'a').replace(/[č]/g, 'c').replace(/[ēe]/g, 'e')
    .replace(/[ģ]/g, 'g').replace(/[ī]/g, 'i').replace(/[ķ]/g, 'k')
    .replace(/[ļ]/g, 'l').replace(/[ņ]/g, 'n').replace(/[ō]/g, 'o')
    .replace(/[š]/g, 's').replace(/[ū]/g, 'u').replace(/[ž]/g, 'z')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ══════════════════════════════════════════════════════════════════════════
// CATEGORIES
// ══════════════════════════════════════════════════════════════════════════
function CategoriesPanel() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', parent_id: '', sort_order: '0' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*').order('sort_order').order('name');
    setItems(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const parents = items.filter(c => !c.parent_id);

  const openNew = () => { setEditId(null); setForm({ name: '', slug: '', parent_id: '', sort_order: '0' }); setModalOpen(true); };
  const openEdit = (c: Category) => {
    setEditId(c.id);
    setForm({ name: c.name, slug: c.slug, parent_id: c.parent_id || '', sort_order: String(c.sort_order || 0) });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || slugify(form.name),
      parent_id: form.parent_id || null,
      sort_order: parseInt(form.sort_order) || 0,
    };
    if (editId) {
      await supabase.from('categories').update(payload).eq('id', editId);
    } else {
      await supabase.from('categories').insert(payload);
    }
    setSaving(false);
    setModalOpen(false);
    load();
  };

  const remove = async (id: string) => {
    await supabase.from('categories').delete().eq('id', id);
    setDeleteId(null);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold">Kategorijas un apakškategorijas</h2>
          <p className="text-xs text-gray-400 mt-0.5">Hierarhiska struktūra — galvenās kategorijas un to apakškategorijas</p>
        </div>
        <ActionBtn onClick={openNew} label="+ Jauna" small />
      </div>

      {loading ? <div className="py-8 text-center text-gray-400 text-sm">Ielādē...</div> : (
        <div className="space-y-1">
          {parents.map(p => (
            <div key={p.id}>
              {deleteId === p.id ? (
                <ConfirmDelete name={p.name} onConfirm={() => remove(p.id)} onCancel={() => setDeleteId(null)} />
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-100 hover:border-gray-200 group">
                  <span className="text-gray-300 text-xs font-mono w-6 text-right">{p.sort_order}</span>
                  <span className="font-semibold text-sm flex-1">{p.name}</span>
                  <span className="text-[10px] text-gray-400 font-mono">{p.slug}</span>
                  <button onClick={() => openEdit(p)} className="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition">Labot</button>
                  <button onClick={() => setDeleteId(p.id)} className="text-xs text-red-400 opacity-0 group-hover:opacity-100 transition">Dzēst</button>
                </div>
              )}
              {/* Subcategories */}
              {items.filter(c => c.parent_id === p.id).map(sub => (
                <div key={sub.id}>
                  {deleteId === sub.id ? (
                    <div className="ml-6"><ConfirmDelete name={sub.name} onConfirm={() => remove(sub.id)} onCancel={() => setDeleteId(null)} /></div>
                  ) : (
                    <div className="flex items-center gap-2 ml-6 px-3 py-1.5 bg-gray-50 rounded border border-gray-50 hover:border-gray-200 group">
                      <span className="text-gray-300 text-xs font-mono w-6 text-right">{sub.sort_order}</span>
                      <span className="text-gray-400 text-xs">└</span>
                      <span className="text-sm flex-1">{sub.name}</span>
                      <span className="text-[10px] text-gray-400 font-mono">{sub.slug}</span>
                      <button onClick={() => openEdit(sub)} className="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition">Labot</button>
                      <button onClick={() => setDeleteId(sub.id)} className="text-xs text-red-400 opacity-0 group-hover:opacity-100 transition">Dzēst</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
          {/* Orphan categories without parent */}
          {items.filter(c => c.parent_id && !items.find(p => p.id === c.parent_id)).map(c => (
             <div key={c.id} className="flex items-center gap-2 px-3 py-2 bg-yellow-50 rounded-lg border border-yellow-100 group">
               <span className="text-xs text-yellow-500">⚠</span>
               <span className="text-sm flex-1">{c.name}</span>
               <button onClick={() => openEdit(c)} className="text-xs text-blue-500">Labot</button>
               <button onClick={() => setDeleteId(c.id)} className="text-xs text-red-400">Dzēst</button>
             </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Labot kategoriju' : 'Jauna kategorija'}>
        <Field label="Nosaukums" required>
          <Input value={form.name} onChange={v => setForm({ ...form, name: v, slug: editId ? form.slug : slugify(v) })} placeholder="Mēbeles" />
        </Field>
        <Field label="Slug">
          <Input value={form.slug} onChange={v => setForm({ ...form, slug: v })} placeholder="mebeles" />
        </Field>
        <Field label="Vecākkategorija">
          <select value={form.parent_id} onChange={e => setForm({ ...form, parent_id: e.target.value })}
            className="w-full p-1.5 border border-gray-200 rounded text-sm bg-[#fafaf9]">
            <option value="">— Galvenā kategorija —</option>
            {parents.filter(p => p.id !== editId).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
        <Field label="Kārtošanas secība">
          <Input type="number" value={form.sort_order} onChange={v => setForm({ ...form, sort_order: v })} placeholder="0" />
        </Field>
        <div className="flex gap-2 mt-5">
          <ActionBtn onClick={save} label={saving ? 'Saglabā...' : 'Saglabāt'} disabled={saving || !form.name.trim()} />
          <ActionBtn onClick={() => setModalOpen(false)} label="Atcelt" variant="secondary" />
        </div>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// SIMPLE TABLE CRUD (manufacturers, dealers)
// ══════════════════════════════════════════════════════════════════════════
function SimpleTablePanel({ table, title, subtitle }: { table: 'manufacturers' | 'dealers'; title: string; subtitle: string }) {
  const [items, setItems] = useState<(Manufacturer | Dealer)[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', country: '', website: '', contact_email: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from(table).select('*').order('name');
    setItems(data || []);
    setLoading(false);
  }, [table]);

  useEffect(() => { load(); }, [load]);

  // Detect which optional columns exist in the table
  const [columns, setColumns] = useState<string[]>([]);
  useEffect(() => {
    // Probe for optional columns by reading a single row
    (async () => {
      const { data, error: e } = await supabase.from(table).select('*').limit(1);
      if (data && data.length > 0) {
        setColumns(Object.keys(data[0]));
      } else if (!e) {
        // Empty table — try insert/read schema via error probing
        // Fallback: just show name
        setColumns(['id', 'name']);
      }
    })();
  }, [table]);

  const hasCol = (col: string) => columns.length === 0 || columns.includes(col);

  const openNew = () => { setEditId(null); setForm({ name: '', country: '', website: '', contact_email: '' }); setModalOpen(true); };
  const openEdit = (item: any) => {
    setEditId(item.id);
    setForm({ name: item.name || '', country: item.country || '', website: item.website || '', contact_email: item.contact_email || '' });
    setModalOpen(true);
  };

  const [error, setError] = useState('');

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    setError('');
    const payload: Record<string, any> = {
      name: form.name.trim(),
    };
    if (hasCol('country')) payload.country = form.country.trim() || null;
    if (hasCol('website')) payload.website = form.website.trim() || null;
    if (hasCol('contact_email')) payload.contact_email = form.contact_email.trim() || null;
    let result;
    if (editId) {
      result = await supabase.from(table).update(payload).eq('id', editId);
    } else {
      result = await supabase.from(table).insert(payload);
    }
    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }
    setSaving(false);
    setModalOpen(false);
    load();
  };

  const remove = async (id: string) => {
    await supabase.from(table).delete().eq('id', id);
    setDeleteId(null);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold">{title}</h2>
          <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
        </div>
        <ActionBtn onClick={openNew} label="+ Jauns" small />
      </div>

      {loading ? <div className="py-8 text-center text-gray-400 text-sm">Ielādē...</div> : items.length === 0 ? (
        <div className="py-8 text-center text-gray-400 text-sm">Nav ierakstu. Pievieno pirmo.</div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-3 py-2 text-[11px] font-semibold text-gray-400 uppercase">Nosaukums</th>
                {hasCol('country') && <th className="text-left px-3 py-2 text-[11px] font-semibold text-gray-400 uppercase">Valsts</th>}
                {hasCol('website') && <th className="text-left px-3 py-2 text-[11px] font-semibold text-gray-400 uppercase">Mājaslapa</th>}
                {hasCol('contact_email') && <th className="text-left px-3 py-2 text-[11px] font-semibold text-gray-400 uppercase">E-pasts</th>}
                <th className="w-20"></th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 group">
                  {deleteId === item.id ? (
                    <td colSpan={5} className="px-3 py-2">
                      <ConfirmDelete name={item.name} onConfirm={() => remove(item.id)} onCancel={() => setDeleteId(null)} />
                    </td>
                  ) : (
                    <>
                      <td className="px-3 py-2 font-medium">{item.name}</td>
                      {hasCol('country') && <td className="px-3 py-2 text-gray-500">{(item as any).country || '—'}</td>}
                      {hasCol('website') && <td className="px-3 py-2 text-gray-500 text-xs">{(item as any).website ? <a href={(item as any).website} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">{(item as any).website.replace(/^https?:\/\//, '')}</a> : '—'}</td>}
                      {hasCol('contact_email') && <td className="px-3 py-2 text-gray-500 text-xs">{(item as any).contact_email || '—'}</td>}
                      <td className="px-3 py-2 text-right">
                        <button onClick={() => openEdit(item)} className="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition mr-2">Labot</button>
                        <button onClick={() => setDeleteId(item.id)} className="text-xs text-red-400 opacity-0 group-hover:opacity-100 transition">Dzēst</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? `Labot ${title.toLowerCase().slice(0, -1)}` : `Jauns ${title.toLowerCase().slice(0, -1)}`}>
        <Field label="Nosaukums" required>
          <Input value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="Vitra" />
        </Field>
        {hasCol('country') && <Field label="Valsts">
          <Input value={form.country} onChange={v => setForm({ ...form, country: v })} placeholder="Šveice" />
        </Field>}
        {hasCol('website') && <Field label="Mājaslapa">
          <Input value={form.website} onChange={v => setForm({ ...form, website: v })} placeholder="https://www.vitra.com" />
        </Field>}
        {hasCol('contact_email') && <Field label="E-pasts">
          <Input value={form.contact_email} onChange={v => setForm({ ...form, contact_email: v })} placeholder="info@vitra.com" type="email" />
        </Field>}
        {error && <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2 mb-2">{error}</div>}
        <div className="flex gap-2 mt-5">
          <ActionBtn onClick={save} label={saving ? 'Saglabā...' : 'Saglabāt'} disabled={saving || !form.name.trim()} />
          <ActionBtn onClick={() => setModalOpen(false)} label="Atcelt" variant="secondary" />
        </div>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// TAG-LIKE PANELS (materials, finishes, types)
// ══════════════════════════════════════════════════════════════════════════
// These are stored as enum-like values. For materials and finishes, we use
// a dedicated 'lookup_values' table. For types — they map to drawing_type enum.

const DEFAULT_TYPES = [
  { key: 'purchasable', label: 'Pērkams', description: 'Gatavs produkts, ko var iegādāties' },
  { key: 'custom_made', label: 'Izgatavojams', description: 'Pēc pasūtījuma izgatavojams elements' },
  { key: 'mixed', label: 'Jaukts', description: 'Kombinācija — daļēji pērkams, daļēji izgatavojams' },
];

function TagPanel({ category, title, subtitle }: { category: 'material' | 'finish'; title: string; subtitle: string }) {
  const [items, setItems] = useState<{ id: string; value: string; sort_order: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [newVal, setNewVal] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editVal, setEditVal] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('lookup_values').select('*').eq('category', category).order('sort_order').order('value');
    setItems(data || []);
    setLoading(false);
  }, [category]);

  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!newVal.trim()) return;
    setSaving(true);
    await supabase.from('lookup_values').insert({ category, value: newVal.trim(), sort_order: items.length });
    setNewVal('');
    setSaving(false);
    load();
  };

  const update = async (id: string) => {
    if (!editVal.trim()) return;
    await supabase.from('lookup_values').update({ value: editVal.trim() }).eq('id', id);
    setEditId(null);
    load();
  };

  const remove = async (id: string) => {
    await supabase.from('lookup_values').delete().eq('id', id);
    setDeleteId(null);
    load();
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-base font-bold">{title}</h2>
        <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
      </div>

      <div className="flex gap-2 mb-4">
        <Input value={newVal} onChange={setNewVal} placeholder={`Jauns ${title.toLowerCase().slice(0, -1)}...`} />
        <ActionBtn onClick={add} label="+ Pievienot" disabled={saving || !newVal.trim()} small />
      </div>

      {loading ? <div className="py-8 text-center text-gray-400 text-sm">Ielādē...</div> : (
        <div className="flex flex-wrap gap-2">
          {items.map(item => (
            <div key={item.id}>
              {deleteId === item.id ? (
                <div className="flex items-center gap-1 bg-red-50 border border-red-200 rounded-lg px-2 py-1">
                  <span className="text-xs text-red-600">Dzēst?</span>
                  <button onClick={() => remove(item.id)} className="text-xs text-red-700 font-bold">Jā</button>
                  <button onClick={() => setDeleteId(null)} className="text-xs text-gray-500">Nē</button>
                </div>
              ) : editId === item.id ? (
                <div className="flex items-center gap-1">
                  <input value={editVal} onChange={e => setEditVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && update(item.id)}
                    className="px-2 py-1 border border-blue-300 rounded text-xs w-28 outline-none" autoFocus />
                  <button onClick={() => update(item.id)} className="text-xs text-blue-600 font-semibold">✓</button>
                  <button onClick={() => setEditId(null)} className="text-xs text-gray-400">✕</button>
                </div>
              ) : (
                <div className="group flex items-center gap-1 px-3 py-1.5 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition">
                  <span className="text-sm">{item.value}</span>
                  <button onClick={() => { setEditId(item.id); setEditVal(item.value); }} className="text-[10px] text-blue-500 opacity-0 group-hover:opacity-100 ml-1">✎</button>
                  <button onClick={() => setDeleteId(item.id)} className="text-[10px] text-red-400 opacity-0 group-hover:opacity-100">✕</button>
                </div>
              )}
            </div>
          ))}
          {items.length === 0 && <div className="text-sm text-gray-400">Nav ierakstu. Pievieno pirmo.</div>}
        </div>
      )}
    </div>
  );
}

function TypesPanel() {
  const [customTypes, setCustomTypes] = useState<{ id: string; value: string; description: string; sort_order: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [newVal, setNewVal] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editVal, setEditVal] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('lookup_values').select('*').eq('category', 'drawing_type').order('sort_order').order('value');
    setCustomTypes(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!newVal.trim()) return;
    setSaving(true);
    await supabase.from('lookup_values').insert({ category: 'drawing_type', value: newVal.trim(), description: newDesc.trim() || null, sort_order: DEFAULT_TYPES.length + customTypes.length });
    setNewVal('');
    setNewDesc('');
    setSaving(false);
    load();
  };

  const update = async (id: string) => {
    if (!editVal.trim()) return;
    await supabase.from('lookup_values').update({ value: editVal.trim(), description: editDesc.trim() || null }).eq('id', id);
    setEditId(null);
    load();
  };

  const remove = async (id: string) => {
    await supabase.from('lookup_values').delete().eq('id', id);
    setDeleteId(null);
    load();
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-base font-bold">Rasējumu tipi</h2>
        <p className="text-xs text-gray-400 mt-0.5">Noklusētie tipi un pielāgotie tipi</p>
      </div>

      {/* Default types */}
      <div className="mb-4">
        <div className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Noklusētie tipi</div>
        <div className="space-y-1">
          {DEFAULT_TYPES.map(t => (
            <div key={t.key} className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-sm font-medium">{t.label}</span>
              <span className="text-xs text-gray-400 flex-1">{t.description}</span>
              <span className="text-[10px] text-gray-300 font-mono">{t.key}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Custom types */}
      <div className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Pielāgotie tipi</div>
      <div className="flex gap-2 mb-3">
        <div className="flex-1">
          <Input value={newVal} onChange={setNewVal} placeholder="Nosaukums..." />
        </div>
        <div className="flex-1">
          <Input value={newDesc} onChange={setNewDesc} placeholder="Apraksts (neobligāti)..." />
        </div>
        <ActionBtn onClick={add} label="+" disabled={saving || !newVal.trim()} small />
      </div>

      {loading ? <div className="py-4 text-center text-gray-400 text-sm">Ielādē...</div> : (
        <div className="space-y-1">
          {customTypes.map(item => (
            <div key={item.id}>
              {deleteId === item.id ? (
                <ConfirmDelete name={item.value} onConfirm={() => remove(item.id)} onCancel={() => setDeleteId(null)} />
              ) : editId === item.id ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
                  <input value={editVal} onChange={e => setEditVal(e.target.value)} className="px-2 py-1 border border-blue-300 rounded text-sm flex-1 outline-none" autoFocus />
                  <input value={editDesc} onChange={e => setEditDesc(e.target.value)} className="px-2 py-1 border border-blue-300 rounded text-sm flex-1 outline-none" placeholder="Apraksts" />
                  <button onClick={() => update(item.id)} className="text-xs text-blue-600 font-semibold">✓</button>
                  <button onClick={() => setEditId(null)} className="text-xs text-gray-400">✕</button>
                </div>
              ) : (
                <div className="flex items-center gap-3 px-3 py-2 bg-white rounded-lg border border-gray-100 hover:border-gray-200 group">
                  <span className="text-sm font-medium">{item.value}</span>
                  <span className="text-xs text-gray-400 flex-1">{item.description || ''}</span>
                  <button onClick={() => { setEditId(item.id); setEditVal(item.value); setEditDesc(item.description || ''); }} className="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition">Labot</button>
                  <button onClick={() => setDeleteId(item.id)} className="text-xs text-red-400 opacity-0 group-hover:opacity-100 transition">Dzēst</button>
                </div>
              )}
            </div>
          ))}
          {customTypes.length === 0 && <div className="text-sm text-gray-400 py-2">Nav pielāgoto tipu.</div>}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// ADMIN PAGE
// ══════════════════════════════════════════════════════════════════════════
export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('categories');

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-5 py-2.5 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3.5">
          <div className="w-8 h-8 bg-[#1a1a1a] rounded-md flex items-center justify-center text-white text-[10px] font-bold tracking-wider font-mono">OAD</div>
          <div>
            <h1 className="text-[15px] font-bold tracking-tight leading-none">Administrēšana</h1>
            <span className="text-[10.5px] text-gray-400">Kategorijas · Ražotāji · Dīleri · Materiāli · Tipi</span>
          </div>
        </div>
        <Link href="/" className="text-xs text-blue-600 hover:text-blue-800 font-medium">← Katalogs</Link>
      </header>

      <div className="flex" style={{ minHeight: 'calc(100vh - 48px)' }}>
        {/* Sidebar */}
        <aside className="w-[200px] bg-white border-r border-gray-200 p-3 shrink-0">
          <div className="space-y-0.5">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition ${tab === t.key ? 'bg-[#1a1a1a] text-white font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>
                <span className="text-sm">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 p-6 max-w-4xl">
          {tab === 'categories' && <CategoriesPanel />}
          {tab === 'manufacturers' && <SimpleTablePanel table="manufacturers" title="Ražotāji" subtitle="Mēbeļu un materiālu ražotāji" />}
          {tab === 'dealers' && <SimpleTablePanel table="dealers" title="Dīleri" subtitle="Pārstāvji un tirgotāji" />}
          {tab === 'materials' && <TagPanel category="material" title="Materiāli" subtitle="Pieejamie materiālu veidi rasējumiem" />}
          {tab === 'finishes' && <TagPanel category="finish" title="Apdares" subtitle="Virsmu apstrādes un apdares veidi" />}
          {tab === 'types' && <TypesPanel />}
        </main>
      </div>
    </div>
  );
}
