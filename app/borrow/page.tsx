'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '@/app/context/AppContext';
import {
  Search, Shield, MapPin, Clock, Filter, X,
  Calculator, Plug, FlaskConical, Package, Wrench, Camera, Dumbbell, Monitor, Paintbrush, ChevronRight, Star
} from 'lucide-react';
import { ItemCategory } from '@/lib/types';

const categoryConfig: Record<string, { icon: React.ElementType; bg: string; text: string; label: string }> = {
  calculator: { icon: Calculator, bg: 'bg-blue-50', text: 'text-blue-600', label: 'Calculator' },
  charger: { icon: Plug, bg: 'bg-amber-50', text: 'text-amber-600', label: 'Charger' },
  science: { icon: FlaskConical, bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'Science' },
  'school-supply': { icon: Package, bg: 'bg-orange-50', text: 'text-orange-600', label: 'School Supply' },
  robotics: { icon: Wrench, bg: 'bg-violet-50', text: 'text-violet-600', label: 'Robotics' },
  media: { icon: Camera, bg: 'bg-pink-50', text: 'text-pink-600', label: 'Media' },
  sports: { icon: Dumbbell, bg: 'bg-red-50', text: 'text-red-500', label: 'Sports' },
  tech: { icon: Monitor, bg: 'bg-indigo-50', text: 'text-indigo-600', label: 'Tech' },
  art: { icon: Paintbrush, bg: 'bg-rose-50', text: 'text-rose-500', label: 'Art' },
  other: { icon: Package, bg: 'bg-gray-50', text: 'text-gray-500', label: 'Other' },
};

const conditionStyles: Record<string, string> = {
  excellent: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  good: 'bg-blue-50 text-blue-700 border-blue-100',
  fair: 'bg-amber-50 text-amber-700 border-amber-100',
};

const itemImages: Record<string, string> = {
  item1: '/ti84.png',
  item2: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=900&q=80',
  item3: '/safetygoggles.jpg',
  item5: '/toolkit.jpg',
  item7: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=900&q=80',
  calculator: '/ti84.png',
  charger: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=900&q=80',
  science: '/safetygoggles.jpg',
  robotics: '/toolkit.jpg',
  tech: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
  media: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80',
  sports: 'https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&w=900&q=80',
  art: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=900&q=80',
  'school-supply': 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=900&q=80',
  other: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=900&q=80',
};

const LOCATIONS = ['All', 'Library', 'Cafeteria', 'Room 210', 'STEM Lab', 'Gym'];
const CATEGORIES: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'All Categories' },
  { value: 'calculator', label: 'Calculator' },
  { value: 'charger', label: 'Charger' },
  { value: 'science', label: 'Science' },
  { value: 'school-supply', label: 'School Supply' },
  { value: 'robotics', label: 'Robotics' },
  { value: 'media', label: 'Media' },
  { value: 'sports', label: 'Sports' },
  { value: 'tech', label: 'Tech' },
  { value: 'art', label: 'Art' },
];

export default function BorrowPage() {
  const { items, currentUser } = useApp();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [location, setLocation] = useState('All');
  const [minTrust, setMinTrust] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const availableItems = useMemo(() => {
    return items.filter((item) => {
      if (item.ownerId === currentUser.id) return false;
      if (!item.isAvailable) return false;
      if (search && !item.name.toLowerCase().includes(search.toLowerCase()) && !item.ownerName.toLowerCase().includes(search.toLowerCase())) return false;
      if (category !== 'all' && item.category !== category) return false;
      if (location !== 'All' && item.pickupLocation !== location) return false;
      if (item.ownerTrustScore < minTrust) return false;
      return true;
    });
  }, [items, search, category, location, minTrust, currentUser.id]);

  const activeFilters = [
    ...(category !== 'all' ? [{ key: 'category', label: CATEGORIES.find((c) => c.value === category)?.label ?? category }] : []),
    ...(location !== 'All' ? [{ key: 'location', label: location }] : []),
    ...(minTrust > 0 ? [{ key: 'trust', label: `Trust ≥ ${minTrust}` }] : []),
  ];

  const clearFilter = (key: string) => {
    if (key === 'category') setCategory('all');
    if (key === 'location') setLocation('All');
    if (key === 'trust') setMinTrust(0);
  };

  return (
    <div className="p-5 sm:p-8 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-950">Borrow Items</h1>
          <p className="text-gray-400 text-sm mt-0.5">{availableItems.length} items available from classmates</p>
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search items or lenders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-300 hover:text-gray-500">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all cursor-pointer ${showFilters ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
        >
          <Filter className="w-4 h-4" />
          {activeFilters.length > 0 ? `Filters (${activeFilters.length})` : 'Filter'}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm grid sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block uppercase tracking-wide">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block uppercase tracking-wide">Location</label>
            <select value={location} onChange={(e) => setLocation(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
              {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block uppercase tracking-wide">Min Trust: {minTrust}</label>
            <input type="range" min={0} max={100} step={5} value={minTrust} onChange={(e) => setMinTrust(Number(e.target.value))} className="w-full accent-indigo-600" />
          </div>
        </div>
      )}

      {/* Active chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          {activeFilters.map(({ key, label }) => (
            <button key={key} onClick={() => clearFilter(key)} className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-full hover:bg-indigo-100 cursor-pointer transition-colors">
              {label} <X className="w-3 h-3" />
            </button>
          ))}
          <button onClick={() => { setCategory('all'); setLocation('All'); setMinTrust(0); }} className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer px-1">Clear all</button>
        </div>
      )}

      {/* Grid */}
      {availableItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <Package className="w-9 h-9 text-gray-200 mx-auto mb-3" />
          <p className="font-semibold text-gray-700 mb-1">No items match your filters</p>
          <button onClick={() => { setSearch(''); setCategory('all'); setLocation('All'); setMinTrust(0); }} className="text-sm text-indigo-600 font-medium hover:underline cursor-pointer mt-1">Clear filters</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableItems.map((item) => {
            const cfg = categoryConfig[item.category] ?? categoryConfig.other;
            const Icon = cfg.icon;
            return (
              <div key={item.id} className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-amber-200 hover:shadow-xl hover:shadow-stone-900/10">
                <div className="relative h-44 overflow-hidden bg-stone-100">
                  <img src={itemImages[item.id] || itemImages[item.category] || itemImages.other} alt={item.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                  <div className={`absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl ${cfg.bg} shadow-sm`}>
                    <Icon className={`h-4 w-4 ${cfg.text}`} />
                  </div>
                  {item.isExpensive && (
                    <span className="absolute right-3 top-3 rounded-full border border-amber-200 bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800">Valuable</span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <div className="mb-2 flex items-start gap-2">
                    <h3 className="flex-1 text-base font-extrabold leading-tight text-gray-950">{item.name}</h3>
                    <span className={`shrink-0 rounded-full border px-2 py-1 text-xs font-bold ${conditionStyles[item.condition]}`}>{item.condition}</span>
                  </div>

                  <span className="mb-3 w-fit rounded-full bg-gray-50 px-2.5 py-1 text-xs font-bold text-gray-500">{cfg.label}</span>

                  <div className="mb-4 flex-1 space-y-1.5 text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">{item.ownerName[0]}</div>
                      <span className="font-medium text-gray-600">{item.ownerName}</span>
                      <div className="ml-auto flex items-center gap-0.5">
                        <Shield className="h-3 w-3 text-emerald-500" />
                        <span className="font-medium text-gray-500">{item.ownerTrustScore}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      <span>{item.availabilityLabel}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3" />
                      <span>{item.pickupLocation}</span>
                    </div>
                  </div>

                  <Link
                    href={`/request?item=${item.id}&category=${item.category}&name=${encodeURIComponent(item.name)}`}
                    className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-gray-950 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
                  >
                    Request
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
