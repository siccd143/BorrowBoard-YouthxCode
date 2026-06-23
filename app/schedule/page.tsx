'use client';

import { ChangeEvent, useState } from 'react';
import { useApp } from '@/app/context/AppContext';
import { AvailabilityBlock, AvailabilityType, DayOfWeek } from '@/lib/types';
import { Clock, MapPin, Plus, Trash2, Calendar, Sparkles, Zap, Upload } from 'lucide-react';
import { parseScheduleText } from '@/lib/scheduleUpload';

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const TYPES: Array<{ value: AvailabilityType; label: string; color: string }> = [
  { value: 'lunch', label: 'Lunch', color: 'bg-orange-100 text-orange-700' },
  { value: 'free-period', label: 'Free Period', color: 'bg-blue-100 text-blue-700' },
  { value: 'after-school', label: 'After School', color: 'bg-green-100 text-green-700' },
  { value: 'before-school', label: 'Before School', color: 'bg-purple-100 text-purple-700' },
  { value: 'passing-period', label: 'Passing Period', color: 'bg-yellow-100 text-yellow-700' },
];

const LOCATIONS = ['Library', 'Cafeteria', 'Room 210', 'STEM Lab', 'Gym', 'Main Office', 'Front Entrance', 'Hallway'];

const typeColor: Record<string, string> = {
  lunch: 'bg-orange-100 text-orange-700 border-orange-200',
  'free-period': 'bg-blue-100 text-blue-700 border-blue-200',
  'after-school': 'bg-green-100 text-green-700 border-green-200',
  'before-school': 'bg-purple-100 text-purple-700 border-purple-200',
  'passing-period': 'bg-yellow-100 text-yellow-700 border-yellow-200',
};

const typeLabel: Record<string, string> = {
  lunch: 'Lunch', 'free-period': 'Free Period', 'after-school': 'After School',
  'before-school': 'Before School', 'passing-period': 'Passing Period',
};

export default function SchedulePage() {
  const { availability, addAvailability, removeAvailability, currentUser, showToast } = useApp();
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    day: 'Monday' as DayOfWeek,
    startTime: '11:20',
    endTime: '11:50',
    location: currentUser.pickupLocation,
    type: 'lunch' as AvailabilityType,
  });

  const myAvailability = availability.filter((a) => a.userId === currentUser.id);

  const handleScheduleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!/\.(txt|csv)$/i.test(file.name)) {
      showToast('Upload a .txt or .csv schedule for now.', 'error');
      event.target.value = '';
      return;
    }

    const blocks = parseScheduleText(await file.text(), currentUser.id, currentUser.pickupLocation);

    if (blocks.length === 0) {
      showToast('No schedule windows found. Try Monday, 11:20 AM - 11:50 AM, Library, Lunch.', 'error');
      event.target.value = '';
      return;
    }

    blocks.forEach(addAvailability);
    showToast(`Imported ${blocks.length} schedule windows.`, 'success');
    event.target.value = '';
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const block: AvailabilityBlock = {
      id: `av-${Date.now()}`,
      userId: currentUser.id,
      day: form.day,
      startTime: form.startTime,
      endTime: form.endTime,
      location: form.location,
      type: form.type,
    };
    addAvailability(block);
    showToast(`Availability added: ${form.day} ${form.startTime}-${form.endTime}`, 'success');
    setShowForm(false);
  };

  const handleRemove = (id: string) => {
    removeAvailability(id);
    showToast('Availability block removed.', 'info');
  };

  const byDay = DAYS.reduce((acc, day) => {
    acc[day] = myAvailability.filter((a) => a.day === day);
    return acc;
  }, {} as Record<DayOfWeek, AvailabilityBlock[]>);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-5 sm:p-8">
      <section className="relative overflow-hidden rounded-3xl bg-stone-950 p-6 text-white shadow-2xl shadow-stone-950/20 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(251,191,36,0.24),transparent_34%),radial-gradient(circle_at_82%_0%,rgba(99,102,241,0.16),transparent_30%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-100/20 bg-white/[0.08] px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-100">
              <Sparkles className="h-3.5 w-3.5" />
              Match engine input
            </div>
            <h1 className="max-w-3xl text-4xl font-extrabold tracking-normal sm:text-5xl">Set your real campus availability.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-300">BorrowBoard uses these windows to score matches, estimate handoff times, and keep requests realistic.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-4">
              <p className="text-2xl font-extrabold">{myAvailability.length}</p>
              <p className="text-xs font-bold uppercase text-stone-400">Your blocks</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-4">
              <p className="text-2xl font-extrabold">{availability.filter((a) => a.day === 'Monday').length}</p>
              <p className="text-xs font-bold uppercase text-stone-400">Monday windows</p>
            </div>
            <div className="col-span-2 rounded-2xl border border-white/10 bg-white/[0.08] p-4 sm:col-span-1">
              <Zap className="mb-2 h-4 w-4 text-amber-200" />
              <p className="text-xs font-bold uppercase text-stone-400">Live matching</p>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Weekly availability</h2>
          <p className="text-slate-500 text-sm mt-0.5">Add lunch, free period, before-school, or after-school windows.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-stone-950/10 bg-white/80 px-4 py-2.5 text-sm font-semibold text-stone-800 transition-colors hover:bg-amber-50">
            <Upload className="h-4 w-4" />
            Import Schedule
            <input type="file" accept=".txt,.csv,text/plain,text/csv" onChange={handleScheduleUpload} className="sr-only" />
          </label>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center justify-center gap-2 rounded-xl bg-stone-950 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-700 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Block
          </button>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleAdd} className="rounded-3xl border border-stone-950/10 bg-white/80 p-5 shadow-sm space-y-4">
          <h2 className="font-extrabold text-slate-900">Add availability block</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Day</label>
              <select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value as DayOfWeek })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as AvailabilityType })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Start Time</label>
              <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">End Time</label>
              <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Location</label>
              <select value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="flex-1 bg-stone-950 hover:bg-amber-700 text-white font-semibold py-2.5 rounded-xl transition-colors cursor-pointer text-sm">Add Block</button>
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl transition-colors cursor-pointer text-sm">Cancel</button>
          </div>
        </form>
      )}

      {/* Weekly view */}
      <div className="bg-white/80 rounded-3xl border border-stone-950/10 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Calendar className="w-5 h-5 text-blue-500" />
          <h2 className="font-semibold text-slate-900">Weekly Availability - {currentUser.name}</h2>
        </div>
        <div className="space-y-4">
          {DAYS.map((day) => {
            const blocks = byDay[day];
            return (
              <div key={day}>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">{day}</p>
                {blocks.length === 0 ? (
                  <p className="text-xs text-slate-400 italic pl-1">No availability set</p>
                ) : (
                  <div className="space-y-2">
                    {blocks.map((block) => (
                      <div key={block.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${typeColor[block.type] || 'bg-slate-50 text-slate-700 border-slate-100'}`}>
                        <span className="text-xs font-semibold">{typeLabel[block.type] || block.type}</span>
                        <div className="flex items-center gap-1.5 text-xs opacity-80">
                          <Clock className="w-3 h-3" />
                          {block.startTime}-{block.endTime}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs opacity-80">
                          <MapPin className="w-3 h-3" />
                          {block.location}
                        </div>
                        <button
                          onClick={() => handleRemove(block.id)}
                          className="ml-auto w-6 h-6 rounded-full bg-white/60 hover:bg-white flex items-center justify-center cursor-pointer transition-colors shrink-0"
                          aria-label="Remove block"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Others availability */}
      <div className="bg-white/80 rounded-3xl border border-stone-950/10 p-5 shadow-sm">
        <h2 className="font-semibold text-slate-900 mb-4">Classmates&apos; Availability (Monday)</h2>
        <div className="space-y-3">
          {availability.filter((a) => a.userId !== currentUser.id && a.day === 'Monday').map((block) => (
            <div key={block.id} className="flex items-center gap-3 text-sm">
              <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
                {block.userId[0].toUpperCase()}
              </div>
              <span className="font-medium text-slate-700 capitalize">{block.userId}</span>
              <div className={`text-xs px-2 py-0.5 rounded-full ${typeColor[block.type]?.split(' ').slice(0, 2).join(' ') || 'bg-slate-100 text-slate-600'}`}>
                {typeLabel[block.type]}
              </div>
              <span className="text-xs text-slate-500">{block.startTime}-{block.endTime}</span>
              <span className="text-xs text-slate-400 flex items-center gap-0.5 ml-auto shrink-0">
                <MapPin className="w-3 h-3" />{block.location}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
