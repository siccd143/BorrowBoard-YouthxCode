'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';
import { LostItem, FoundItem, ItemCategory } from '@/lib/types';
import { Search, AlertCircle, CheckCircle, Clock, MapPin, Upload, Zap, X, HelpCircle, Sparkles, Shield } from 'lucide-react';
import { CATEGORY_OPTIONS, inferItemCategory } from '@/lib/categories';

const LOCATIONS = ['Library', 'Cafeteria', 'Room 210', 'STEM Lab', 'Gym', 'Hallway', 'Main Office', 'Front Entrance', 'Science Room', 'Math Room'];

function matchScore(lost: LostItem, found: FoundItem): number {
  let score = 0;
  if (lost.category === found.category) score += 40;
  const lostWords = lost.itemName.toLowerCase().split(' ');
  const foundWords = found.itemName.toLowerCase().split(' ');
  const nameOverlap = lostWords.filter((w) => foundWords.some((fw) => fw.includes(w) || w.includes(fw))).length;
  score += Math.min(nameOverlap * 15, 30);
  if (lost.lastSeenLocation === found.locationFound) score += 20;
  else if (lost.lastSeenLocation.toLowerCase().includes(found.locationFound.toLowerCase()) || found.locationFound.toLowerCase().includes(lost.lastSeenLocation.toLowerCase())) score += 10;
  return Math.min(score, 95);
}

function LostFoundContent() {
  const { lostItems, foundItems, addLostItem, addFoundItem, currentUser, showToast } = useApp();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'lost' ? 'lost' : searchParams.get('tab') === 'found' ? 'found' : 'lost';
  const [activeTab, setActiveTab] = useState<'lost' | 'found' | 'report-lost' | 'report-found'>(initialTab);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [verificationAnswer, setVerificationAnswer] = useState('');
  const [claimedItems, setClaimedItems] = useState<Set<string>>(new Set());

  const [lostForm, setLostForm] = useState({
    itemName: '',
    category: 'other' as ItemCategory,
    description: '',
    lastSeenLocation: '',
    timeLost: '',
    uniqueDetail: '',
  });

  const [foundForm, setFoundForm] = useState({
    itemName: '',
    category: 'other' as ItemCategory,
    description: '',
    locationFound: '',
    timeFound: '',
    verificationDetail: '',
  });

  const possibleMatches = useMemo(() => {
    const results: Array<{ lost: LostItem; found: FoundItem; score: number }> = [];
    for (const lost of lostItems.filter((l) => l.status === 'active')) {
      for (const found of foundItems.filter((f) => f.status === 'unclaimed')) {
        const score = matchScore(lost, found);
        if (score >= 40) {
          results.push({ lost, found, score });
        }
      }
    }
    return results.sort((a, b) => b.score - a.score);
  }, [lostItems, foundItems]);

  const handleReportLost = (e: React.FormEvent) => {
    e.preventDefault();
    const item: LostItem = {
      id: `lost-${Date.now()}`,
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      itemName: lostForm.itemName,
      category: lostForm.category,
      description: lostForm.description,
      lastSeenLocation: lostForm.lastSeenLocation,
      timeLost: lostForm.timeLost || new Date().toISOString(),
      uniqueDetail: lostForm.uniqueDetail,
      status: 'active',
      reportedAt: new Date().toISOString(),
    };
    addLostItem(item);
    showToast(`Lost item "${lostForm.itemName}" reported. We'll notify you if a match is found.`, 'info');
    setActiveTab('lost');
    setLostForm({ itemName: '', category: 'other', description: '', lastSeenLocation: '', timeLost: '', uniqueDetail: '' });
  };

  const handleReportFound = (e: React.FormEvent) => {
    e.preventDefault();
    const item: FoundItem = {
      id: `found-${Date.now()}`,
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      itemName: foundForm.itemName,
      category: foundForm.category,
      description: foundForm.description,
      locationFound: foundForm.locationFound,
      timeFound: foundForm.timeFound || new Date().toISOString(),
      verificationDetail: foundForm.verificationDetail,
      status: 'unclaimed',
      reportedAt: new Date().toISOString(),
    };
    addFoundItem(item);
    showToast(`Found item reported! +10 credits when it gets claimed.`, 'success');
    setActiveTab('found');
    setFoundForm({ itemName: '', category: 'other', description: '', locationFound: '', timeFound: '', verificationDetail: '' });
  };

  const handleClaim = (foundId: string) => {
    if (!verificationAnswer.trim()) {
      showToast('Please answer the verification question.', 'error');
      return;
    }
    setClaimedItems((prev) => new Set([...prev, foundId]));
    setClaimingId(null);
    setVerificationAnswer('');
    showToast('Item claimed! Head to the front office to pick it up.', 'success');
  };

  const TabButton = ({ id, label }: { id: typeof activeTab; label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors cursor-pointer ${activeTab === id ? 'bg-stone-950 text-white' : 'text-stone-600 hover:bg-stone-100'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-5 sm:p-8">
      <section className="relative overflow-hidden rounded-3xl bg-stone-950 p-6 text-white shadow-2xl shadow-stone-950/20 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(251,191,36,0.24),transparent_34%),radial-gradient(circle_at_82%_0%,rgba(16,185,129,0.16),transparent_30%)]" />
        <div className="relative grid gap-6 lg:grid-cols-[1.35fr_0.85fr] lg:items-end">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-100/20 bg-white/[0.08] px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-100">
              <Sparkles className="h-3.5 w-3.5" />
              Recovery desk
            </div>
            <h1 className="max-w-2xl text-4xl font-extrabold sm:text-5xl">Lost items get matched, not buried.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-300">Report a lost or found item, then BorrowBoard compares category, location, timing, and private verification details.</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-4"><p className="text-3xl font-black">{lostItems.filter((l) => l.status === 'active').length}</p><p className="text-xs font-bold uppercase text-stone-400">Lost</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-4"><p className="text-3xl font-black">{foundItems.filter((f) => f.status === 'unclaimed').length}</p><p className="text-xs font-bold uppercase text-stone-400">Found</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-4"><Shield className="mx-auto mb-2 h-5 w-5 text-amber-200" /><p className="text-xs font-bold uppercase text-stone-400">Verified</p></div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex w-fit flex-wrap items-center gap-2 rounded-2xl border border-stone-950/10 bg-white/75 p-1 shadow-sm">
        <TabButton id="lost" label={`Lost Items (${lostItems.filter((l) => l.status === 'active').length})`} />
        <TabButton id="found" label={`Found Items (${foundItems.filter((f) => f.status === 'unclaimed').length})`} />
        <TabButton id="report-lost" label="Report Lost" />
        <TabButton id="report-found" label="Report Found" />
      </div>

      {/* Possible Matches Banner */}
      {possibleMatches.length > 0 && (activeTab === 'lost' || activeTab === 'found') && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-green-600" />
            <span className="text-sm font-bold text-green-800">{possibleMatches.length} Possible Match{possibleMatches.length !== 1 ? 'es' : ''} Found</span>
            <span className="text-xs text-green-600 ml-auto">Similarity match active</span>
          </div>
          <div className="space-y-3">
            {possibleMatches.map(({ lost, found, score }) => (
              <div key={`${lost.id}-${found.id}`} className="rounded-2xl border border-green-100 bg-white p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-green-700 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Possible Match
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-16 bg-slate-100 rounded-full h-1.5">
                      <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${score}%` }} />
                    </div>
                    <span className="text-xs font-bold text-green-700">{score}% confidence</span>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 text-xs mb-3">
                  <div className="bg-red-50 rounded-lg p-2.5">
                    <p className="font-bold text-red-700 mb-1">Lost: {lost.itemName}</p>
                    <p className="text-slate-600">Reported by {lost.reporterName}</p>
                    <p className="text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />{lost.lastSeenLocation}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2.5">
                    <p className="font-bold text-green-700 mb-1">Found: {found.itemName}</p>
                    <p className="text-slate-600">Found by {found.reporterName}</p>
                    <p className="text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />{found.locationFound}
                    </p>
                  </div>
                </div>

                {claimedItems.has(found.id) ? (
                  <div className="flex items-center gap-2 bg-green-100 rounded-lg px-3 py-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-semibold text-green-700">Claimed! Pick up at front office.</span>
                  </div>
                ) : claimingId === found.id ? (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
                      Verification: What brand or unique marking is on the item?
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={verificationAnswer}
                        onChange={(e) => setVerificationAnswer(e.target.value)}
                        placeholder="Enter your answer..."
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button onClick={() => handleClaim(found.id)} className="bg-green-600 text-white text-xs font-semibold px-3 py-2 rounded-lg cursor-pointer hover:bg-green-700">Claim</button>
                      <button onClick={() => { setClaimingId(null); setVerificationAnswer(''); }} className="bg-slate-100 text-slate-600 text-xs px-2 py-2 rounded-lg cursor-pointer hover:bg-slate-200"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setClaimingId(found.id)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    Claim Item
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lost Items Tab */}
      {activeTab === 'lost' && (
        <div className="space-y-3">
          {lostItems.filter((l) => l.status === 'active').length === 0 ? (
            <div className="bg-white/85 rounded-3xl border border-stone-100 p-10 text-center">
              <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="font-semibold text-slate-600 mb-1">No lost items reported</p>
              <button onClick={() => setActiveTab('report-lost')} className="text-sm text-amber-700 font-bold hover:underline cursor-pointer">Report a lost item</button>
            </div>
          ) : (
            lostItems.filter((l) => l.status === 'active').map((item) => (
              <div key={item.id} className="bg-white/85 rounded-3xl border border-stone-100 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="font-semibold text-slate-900">{item.itemName}</h3>
                    <p className="text-xs text-slate-500">Reported by {item.reporterName}</p>
                  </div>
                  <span className="bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 capitalize">{item.category}</span>
                </div>
                {item.description && <p className="text-sm text-slate-600 mb-2">{item.description}</p>}
                <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.lastSeenLocation}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(item.reportedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Found Items Tab */}
      {activeTab === 'found' && (
        <div className="space-y-3">
          {foundItems.filter((f) => f.status === 'unclaimed').length === 0 ? (
            <div className="bg-white/85 rounded-3xl border border-stone-100 p-10 text-center">
              <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="font-semibold text-slate-600 mb-1">No found items reported</p>
              <button onClick={() => setActiveTab('report-found')} className="text-sm text-amber-700 font-bold hover:underline cursor-pointer">Report a found item</button>
            </div>
          ) : (
            foundItems.filter((f) => f.status === 'unclaimed').map((item) => (
              <div key={item.id} className="bg-white/85 rounded-3xl border border-stone-100 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="font-semibold text-slate-900">{item.itemName}</h3>
                    <p className="text-xs text-slate-500">Found by {item.reporterName}</p>
                  </div>
                  <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 capitalize">{item.category}</span>
                </div>
                {item.description && <p className="text-sm text-slate-600 mb-2">{item.description}</p>}
                <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.locationFound}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(item.reportedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Report Lost Form */}
      {activeTab === 'report-lost' && (
        <form onSubmit={handleReportLost} className="bg-white/85 rounded-3xl border border-stone-100 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h2 className="font-bold text-slate-900">Report a Lost Item</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Item Name *</label>
              <input
                type="text"
                required
                value={lostForm.itemName}
                onChange={(e) => {
                  const itemName = e.target.value;
                  const inferred = inferItemCategory(itemName);
                  setLostForm({ ...lostForm, itemName, category: inferred === 'other' ? lostForm.category : inferred });
                }}
                placeholder="e.g. USB-C Charger"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
              <select value={lostForm.category} onChange={(e) => setLostForm({ ...lostForm, category: e.target.value as ItemCategory })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {CATEGORY_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
            <textarea value={lostForm.description} onChange={(e) => setLostForm({ ...lostForm, description: e.target.value })} placeholder="Describe the item in detail..." rows={2} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Last Seen Location *</label>
              <select value={lostForm.lastSeenLocation} onChange={(e) => setLostForm({ ...lostForm, lastSeenLocation: e.target.value })} required className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select location...</option>
                {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">When Lost</label>
              <input type="datetime-local" value={lostForm.timeLost} onChange={(e) => setLostForm({ ...lostForm, timeLost: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Unique Identifying Detail (private - used for verification)</label>
            <input type="text" value={lostForm.uniqueDetail} onChange={(e) => setLostForm({ ...lostForm, uniqueDetail: e.target.value })} placeholder="e.g. Has a blue sticker on the back, initials scratched on it" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <p className="text-xs text-slate-400 mt-1">This detail won&apos;t be shown publicly - used to verify your ownership.</p>
          </div>
          <button type="submit" className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition-colors cursor-pointer">Report Lost Item</button>
        </form>
      )}

      {/* Report Found Form */}
      {activeTab === 'report-found' && (
        <form onSubmit={handleReportFound} className="bg-white/85 rounded-3xl border border-stone-100 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Search className="w-5 h-5 text-green-500" />
            <h2 className="font-bold text-slate-900">Report a Found Item</h2>
          </div>
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:border-green-300 transition-colors">
            <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
            <p className="text-xs text-slate-500">Upload photo <span className="text-slate-400">(AI photo classification coming soon)</span></p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Item Name / Type *</label>
              <input
                type="text"
                required
                value={foundForm.itemName}
                onChange={(e) => {
                  const itemName = e.target.value;
                  const inferred = inferItemCategory(itemName);
                  setFoundForm({ ...foundForm, itemName, category: inferred === 'other' ? foundForm.category : inferred });
                }}
                placeholder="e.g. USB-C Charger"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
              <select value={foundForm.category} onChange={(e) => setFoundForm({ ...foundForm, category: e.target.value as ItemCategory })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {CATEGORY_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
            <textarea value={foundForm.description} onChange={(e) => setFoundForm({ ...foundForm, description: e.target.value })} placeholder="Describe what you found..." rows={2} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Where Found *</label>
              <select value={foundForm.locationFound} onChange={(e) => setFoundForm({ ...foundForm, locationFound: e.target.value })} required className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select location...</option>
                {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">When Found</label>
              <input type="datetime-local" value={foundForm.timeFound} onChange={(e) => setFoundForm({ ...foundForm, timeFound: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Verification Detail (hidden from public)</label>
            <input type="text" value={foundForm.verificationDetail} onChange={(e) => setFoundForm({ ...foundForm, verificationDetail: e.target.value })} placeholder="e.g. There's a small blue sticker on the cable" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <p className="text-xs text-slate-400 mt-1">Used as the verification question when someone tries to claim it.</p>
          </div>
          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors cursor-pointer">Report Found Item · Earn 10 Credits</button>
        </form>
      )}
    </div>
  );
}

export default function LostFoundPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading...</div>}>
      <LostFoundContent />
    </Suspense>
  );
}
