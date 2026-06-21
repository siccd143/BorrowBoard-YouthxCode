'use client';

import { useState } from 'react';
import { useApp } from '@/app/context/AppContext';
import { Item, ItemCategory, ItemCondition, DayOfWeek } from '@/lib/types';
import { CheckCircle, Upload, AlertTriangle, Plus } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES: Array<{ value: ItemCategory; label: string }> = [
  { value: 'calculator', label: 'Calculator' },
  { value: 'charger', label: 'Charger' },
  { value: 'science', label: 'Science Equipment' },
  { value: 'school-supply', label: 'School Supply' },
  { value: 'robotics', label: 'Robotics / Tools' },
  { value: 'media', label: 'Media / Photography' },
  { value: 'sports', label: 'Sports' },
  { value: 'tech', label: 'Tech Accessories' },
  { value: 'art', label: 'Art Supplies' },
  { value: 'other', label: 'Other' },
];

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

  const toggleDay = (day: DayOfWeek) => {
    setForm((prev) => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter((d) => d !== day)
        : [...prev.availableDays, day],
    }));
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
      availabilityLabel: `${form.availableDays.join(', ')} ${form.startTime}–${form.endTime}`,
      isExpensive: form.isExpensive,
      rules: form.rules || undefined,
      isAvailable: true,
      listedAt: new Date().toISOString(),
    };

    addItem(item);
    showToast(`${item.name} listed successfully! +5 credits when someone borrows it.`, 'success');
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-lg mx-auto">
        <div className="bg-white rounded-2xl border border-green-100 p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Item Listed!</h2>
          <p className="text-slate-500 text-sm mb-1"><strong>{form.name}</strong> is now visible in the marketplace.</p>
          <p className="text-xs text-green-600 font-medium mb-6">You&apos;ll earn 15 credits when someone borrows it.</p>
          <div className="flex gap-3">
            <Link href="/borrow" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-3 rounded-xl text-center transition-colors cursor-pointer">
              Browse Marketplace
            </Link>
            <button
              onClick={() => { setSubmitted(false); setForm({ name: '', category: 'school-supply', description: '', condition: 'good', availableDays: [], startTime: '11:20', endTime: '11:50', pickupLocation: currentUser.pickupLocation, isExpensive: false, rules: '' }); }}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold py-3 rounded-xl transition-colors cursor-pointer"
            >
              List Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">List an Item</h1>
        <p className="text-slate-500 text-sm mt-0.5">Share something you&apos;re willing to lend to classmates.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
        {/* Photo upload placeholder */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Item Photo</label>
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-300 transition-colors cursor-pointer">
            <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-500 font-medium">Click to upload photo</p>
            <p className="text-xs text-slate-400 mt-1">AI photo classification coming soon</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Item Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. TI-84 Plus Calculator"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category *</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as ItemCategory })}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe the item, any accessories included, or anything the borrower should know..."
            rows={3}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Condition */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Condition *</label>
          <div className="grid grid-cols-3 gap-2">
            {CONDITIONS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setForm({ ...form, condition: c.value })}
                className={`flex flex-col items-center text-center p-3 rounded-xl border transition-colors cursor-pointer ${
                  form.condition === c.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <p className="text-sm font-semibold">{c.label}</p>
                <p className="text-xs opacity-70 mt-0.5">{c.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Available days */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Available Days *</label>
          <div className="flex gap-2 flex-wrap">
            {DAYS.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
                  form.availableDays.includes(day)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Start Time</label>
            <input
              type="time"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">End Time</label>
            <input
              type="time"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Pickup Location</label>
            <select
              value={form.pickupLocation}
              onChange={(e) => setForm({ ...form, pickupLocation: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        {/* Expensive toggle */}
        <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-100 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Valuable Item</p>
              <p className="text-xs text-slate-500">Mark if this item is expensive or hard to replace.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setForm({ ...form, isExpensive: !form.isExpensive })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 ${form.isExpensive ? 'bg-orange-500' : 'bg-slate-200'}`}
            role="switch"
            aria-checked={form.isExpensive}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.isExpensive ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Rules or Notes for Borrower</label>
          <textarea
            value={form.rules}
            onChange={(e) => setForm({ ...form, rules: e.target.value })}
            placeholder="e.g. Please return with the case. Don't use the charger overnight."
            rows={2}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          List Item
        </button>
      </form>
    </div>
  );
}
