'use client';

import { ChangeEvent, useState } from 'react';
import { useApp } from '@/app/context/AppContext';
import { DayOfWeek, Item, ItemCategory, ItemCondition } from '@/lib/types';
import { AlertTriangle, Camera, CheckCircle, Plus, Shield, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { CATEGORY_OPTIONS, inferItemCategory } from '@/lib/categories';
import { classifyImage } from '@/lib/clientImageModel';

const CONDITIONS: Array<{ value: ItemCondition; label: string; desc: string }> = [
  { value: 'excellent', label: 'Excellent', desc: 'Like new, no wear' },
  { value: 'good', label: 'Good', desc: 'Minor wear, works perfectly' },
  { value: 'fair', label: 'Fair', desc: 'Visible wear, still functional' },
];

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const LOCATIONS = ['Library', 'Cafeteria', 'Room 210', 'STEM Lab', 'Gym', 'Main Office', 'Front Entrance'];

export default function ListItemPage() {
  const { addItem, currentUser, showToast } = useApp();
  const [submitted, setSubmitted] = useState(false);
  const [photoStatus, setPhotoStatus] = useState('Upload item photo');
  const [form, setForm] = useState({
    name: '',
    category: 'school-supply' as ItemCategory,
    description: '',
    condition: 'good' as ItemCondition,
    availableDays: [] as DayOfWeek[],
    startTime: '11:20',
    endTime: '11:50',
    pickupLocation: currentUser.pickupLocation,
    isExpensive: false,
    rules: '',
  });

  const resetForm = () => setForm({
    name: '',
    category: 'school-supply',
    description: '',
    condition: 'good',
    availableDays: [],
    startTime: '11:20',
    endTime: '11:50',
    pickupLocation: currentUser.pickupLocation,
    isExpensive: false,
    rules: '',
  });

  const toggleDay = (day: DayOfWeek) => {
    setForm((prev) => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter((d) => d !== day)
        : [...prev.availableDays, day],
    }));
  };

  const handlePhotoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setPhotoStatus('Running trained model...');

    try {
      const result = await classifyImage(file);

      if (!result.ok || !result.category) {
        setPhotoStatus(result.error || 'Model could not classify this photo');
        showToast(result.error || 'Model could not classify this photo.', 'info');
        return;
      }

      setForm((prev) => ({
        ...prev,
        name: prev.name || result.displayName || result.label || prev.name,
        category: result.category || prev.category,
        description: prev.description || (result.label ? `Detected by BorrowBoard model: ${result.label}` : prev.description),
      }));
      setPhotoStatus(`${result.displayName || result.label} / ${Math.round((result.confidence || 0) * 100)}% confidence`);
      showToast(`Model classified this as ${result.displayName || result.label}.`, 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not classify this image.';
      setPhotoStatus(message);
      showToast(message, 'error');
    } finally {
      event.target.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.availableDays.length === 0) {
      showToast('Please select at least one available day.', 'error');
      return;
    }

    const item: Item = {
      id: `item-${Date.now()}`,
      name: form.name,
      category: form.category,
      description: form.description,
      condition: form.condition,
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      ownerTrustScore: currentUser.trustScore,
      pickupLocation: form.pickupLocation,
      availableDays: form.availableDays,
      availableStart: form.startTime,
      availableEnd: form.endTime,
      availabilityLabel: `${form.availableDays.join(', ')} ${form.startTime}-${form.endTime}`,
      isExpensive: form.isExpensive,
      rules: form.rules || undefined,
      isAvailable: true,
      listedAt: new Date().toISOString(),
    };

    addItem(item);
    showToast(`${item.name} listed successfully. +15 credits when someone borrows it.`, 'success');
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg p-5 sm:p-8">
        <div className="rounded-3xl border border-emerald-100 bg-white/85 p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="mb-2 text-xl font-extrabold text-slate-950">Item listed</h2>
          <p className="mb-1 text-sm text-slate-500"><strong>{form.name}</strong> is now visible in the marketplace.</p>
          <p className="mb-6 text-xs font-medium text-emerald-600">You&apos;ll earn 15 credits when someone borrows it.</p>
          <div className="flex gap-3">
            <Link href="/borrow" className="flex-1 rounded-xl bg-stone-950 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-amber-700">
              Browse Marketplace
            </Link>
            <button onClick={() => { setSubmitted(false); resetForm(); }} className="flex-1 rounded-xl bg-stone-100 py-3 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-200 cursor-pointer">
              List Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-5 sm:p-8">
      <section className="relative overflow-hidden rounded-3xl bg-stone-950 p-6 text-white shadow-2xl shadow-stone-950/20 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(251,191,36,0.26),transparent_34%),radial-gradient(circle_at_82%_0%,rgba(255,255,255,0.12),transparent_30%)]" />
        <div className="relative grid gap-6 lg:grid-cols-[1.35fr_0.85fr] lg:items-end">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-100/20 bg-white/[0.08] px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-100">
              <Sparkles className="h-3.5 w-3.5" />
              Campus inventory
            </div>
            <h1 className="max-w-2xl text-4xl font-extrabold sm:text-5xl">List an item classmates can actually borrow.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-300">Add the photo, rules, handoff window, and location so the match engine can rank your item accurately.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-amber-100"><Shield className="h-4 w-4" /> Listing checklist</div>
            {['Clear item name', 'Real availability', 'Return rules'].map((item) => (
              <div key={item} className="mb-2 flex items-center gap-2 rounded-xl bg-white/[0.08] px-3 py-2 text-xs text-stone-300 last:mb-0"><CheckCircle className="h-3.5 w-3.5 text-emerald-300" />{item}</div>
            ))}
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-stone-950/10 bg-white/85 p-6 shadow-sm">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Item Photo</label>
          <label className="relative block overflow-hidden rounded-3xl border border-stone-950/10 bg-stone-950 p-6 text-center text-white transition-colors cursor-pointer hover:border-amber-300">
            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="sr-only" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(251,191,36,0.22),transparent_32%)]" />
            <div className="relative">
              <Camera className="mx-auto mb-2 h-7 w-7 text-amber-100" />
              <p className="text-sm font-bold">{photoStatus}</p>
              <p className="mt-1 text-xs text-stone-400">The trained YOLO model will suggest the item name and category.</p>
            </div>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Item Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => {
                const nextName = e.target.value;
                const inferred = inferItemCategory(nextName);
                setForm({ ...form, name: nextName, category: inferred === 'other' ? form.category : inferred });
              }}
              placeholder="e.g. TI-84 Plus Calculator"
              className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Category *</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ItemCategory })} className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
              {CATEGORY_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the item, accessories included, or anything the borrower should know..." rows={3} className="w-full resize-none rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Condition *</label>
          <div className="grid grid-cols-3 gap-2">
            {CONDITIONS.map((condition) => (
              <button key={condition.value} type="button" onClick={() => setForm({ ...form, condition: condition.value })} className={`rounded-xl border p-3 text-center transition-colors cursor-pointer ${form.condition === condition.value ? 'border-amber-500 bg-amber-50 text-amber-800' : 'border-stone-200 text-stone-600 hover:bg-stone-50'}`}>
                <p className="text-sm font-semibold">{condition.label}</p>
                <p className="mt-0.5 text-xs opacity-70">{condition.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Available Days *</label>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((day) => (
              <button key={day} type="button" onClick={() => toggleDay(day)} className={`rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${form.availableDays.includes(day) ? 'border-stone-950 bg-stone-950 text-white' : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'}`}>
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div><label className="mb-1.5 block text-sm font-semibold text-slate-700">Start Time</label><input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" /></div>
          <div><label className="mb-1.5 block text-sm font-semibold text-slate-700">End Time</label><input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" /></div>
          <div><label className="mb-1.5 block text-sm font-semibold text-slate-700">Pickup Location</label><select value={form.pickupLocation} onChange={(e) => setForm({ ...form, pickupLocation: e.target.value })} className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">{LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}</select></div>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-orange-100 bg-orange-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
            <div><p className="text-sm font-semibold text-slate-900">Valuable item</p><p className="text-xs text-slate-500">Mark if this item is expensive or hard to replace.</p></div>
          </div>
          <button type="button" onClick={() => setForm({ ...form, isExpensive: !form.isExpensive })} className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer ${form.isExpensive ? 'bg-orange-500' : 'bg-stone-200'}`} role="switch" aria-checked={form.isExpensive}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.isExpensive ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Rules or Notes for Borrower</label>
          <textarea value={form.rules} onChange={(e) => setForm({ ...form, rules: e.target.value })} placeholder="e.g. Please return with the case. Don't use the charger overnight." rows={2} className="w-full resize-none rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>

        <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-950 py-3 font-semibold text-white transition-colors hover:bg-amber-700 cursor-pointer">
          <Plus className="h-4 w-4" />
          List Item
        </button>
      </form>
    </div>
  );
}
