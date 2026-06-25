'use client';

import { Fragment, PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '@/app/context/AppContext';
import { AVAILABILITY_TYPES, AvailabilityBlock, AvailabilityType, DAYS, DayOfWeek, LOCATIONS } from '@/lib/types';
import { Calendar, Hand, MapPin, Sparkles, Trash2, Zap } from 'lucide-react';

// Weekly grid: 7:30 AM -> 4:00 PM in 30-minute slots. Dragging across a day's
// column paints availability directly, so there are no block forms or schedule
// files to parse — a contiguous run of painted slots with the same location and
// type becomes one block.
const START_MIN = 7 * 60 + 30;
const SLOT_MIN = 30;
const SLOT_COUNT = 17;

const slotStart = (index: number) => START_MIN + index * SLOT_MIN;
const minToTime = (min: number) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
const timeToMin = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};
const slotKey = (day: DayOfWeek, index: number) => `${day}|${index}`;

const formatClock = (min: number) => {
  const h = Math.floor(min / 60);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = ((h + 11) % 12) + 1;
  return `${hour12}:${String(min % 60).padStart(2, '0')} ${period}`;
};

const typeColor: Record<AvailabilityType, string> = {
  lunch: 'bg-orange-100 text-orange-700',
  'free-period': 'bg-blue-100 text-blue-700',
  'after-school': 'bg-green-100 text-green-700',
  'before-school': 'bg-purple-100 text-purple-700',
};

const typeLabel: Record<AvailabilityType, string> = {
  lunch: 'Lunch',
  'free-period': 'Free Period',
  'after-school': 'After School',
  'before-school': 'Before School',
};

// Each location gets its own colour so a painted week reads at a glance. Indexed
// against the shared LOCATIONS list and cycled if a school defines more spots.
const LOCATION_CELL = [
  'border-amber-300 bg-gradient-to-br from-amber-300 to-amber-400 shadow-sm shadow-amber-500/20',
  'border-sky-300 bg-gradient-to-br from-sky-300 to-sky-400 shadow-sm shadow-sky-500/20',
  'border-emerald-300 bg-gradient-to-br from-emerald-300 to-emerald-400 shadow-sm shadow-emerald-500/20',
  'border-violet-300 bg-gradient-to-br from-violet-300 to-violet-400 shadow-sm shadow-violet-500/20',
  'border-rose-300 bg-gradient-to-br from-rose-300 to-rose-400 shadow-sm shadow-rose-500/20',
  'border-teal-300 bg-gradient-to-br from-teal-300 to-teal-400 shadow-sm shadow-teal-500/20',
  'border-fuchsia-300 bg-gradient-to-br from-fuchsia-300 to-fuchsia-400 shadow-sm shadow-fuchsia-500/20',
  'border-lime-300 bg-gradient-to-br from-lime-300 to-lime-400 shadow-sm shadow-lime-500/20',
  'border-cyan-300 bg-gradient-to-br from-cyan-300 to-cyan-400 shadow-sm shadow-cyan-500/20',
  'border-orange-300 bg-gradient-to-br from-orange-300 to-orange-400 shadow-sm shadow-orange-500/20',
];
const LOCATION_DOT = [
  'bg-amber-400',
  'bg-sky-400',
  'bg-emerald-400',
  'bg-violet-400',
  'bg-rose-400',
  'bg-teal-400',
  'bg-fuchsia-400',
  'bg-lime-400',
  'bg-cyan-400',
  'bg-orange-400',
];
const locColor = (location: string) => {
  const i = LOCATIONS.indexOf(location);
  return (i < 0 ? 0 : i) % LOCATION_CELL.length;
};

interface SlotMeta {
  location: string;
  type: AvailabilityType;
}

function blocksToSlots(blocks: AvailabilityBlock[]): Map<string, SlotMeta> {
  const map = new Map<string, SlotMeta>();
  for (const block of blocks) {
    const from = Math.max(0, Math.round((timeToMin(block.startTime) - START_MIN) / SLOT_MIN));
    const to = Math.min(SLOT_COUNT, Math.round((timeToMin(block.endTime) - START_MIN) / SLOT_MIN));
    for (let i = from; i < to; i++) map.set(slotKey(block.day, i), { location: block.location, type: block.type });
  }
  return map;
}

// A run breaks when slots stop being contiguous OR when the location/type
// changes, so two back-to-back blocks at different spots stay separate.
function runsForDay(
  day: DayOfWeek,
  slots: Map<string, SlotMeta>,
): Array<{ start: number; end: number; location: string; type: AvailabilityType }> {
  const cells = [...slots.entries()]
    .filter(([key]) => key.startsWith(`${day}|`))
    .map(([key, meta]) => ({ index: Number(key.split('|')[1]), ...meta }))
    .sort((a, b) => a.index - b.index);

  const runs: Array<{ start: number; end: number; location: string; type: AvailabilityType }> = [];
  for (const cell of cells) {
    const last = runs[runs.length - 1];
    if (last && cell.index === last.end && last.location === cell.location && last.type === cell.type) {
      last.end = cell.index + 1;
    } else {
      runs.push({ start: cell.index, end: cell.index + 1, location: cell.location, type: cell.type });
    }
  }
  return runs;
}

export default function SchedulePage() {
  const { availability, addAvailability, removeAvailability, currentUser, showToast } = useApp();

  const userBlocks = useMemo(
    () => availability.filter((a) => a.userId === currentUser.id),
    [availability, currentUser.id],
  );

  const [slots, setSlots] = useState<Map<string, SlotMeta>>(() => blocksToSlots(userBlocks));
  const [dragging, setDragging] = useState(false);

  // The location/type the next painted slots get. Students pick these instead of
  // the app guessing from the clock or forcing their single profile pickup spot.
  const [activeLocation, setActiveLocation] = useState<string>(
    () => (LOCATIONS.includes(currentUser.pickupLocation) ? currentUser.pickupLocation : LOCATIONS[0]),
  );
  const [activeType, setActiveType] = useState<AvailabilityType>('free-period');

  const gridRef = useRef<HTMLDivElement>(null);
  const slotsRef = useRef(slots);
  const draggingRef = useRef(false);
  const dragDay = useRef<DayOfWeek | null>(null);
  const dragMode = useRef<'add' | 'remove'>('add');
  const dragAnchor = useRef(0);
  const dragBase = useRef<Map<string, SlotMeta>>(new Map());

  // Keep the active selection in refs so the pointer handlers paint with the
  // latest choice without re-binding mid-drag.
  const activeLocationRef = useRef(activeLocation);
  const activeTypeRef = useRef(activeType);
  activeLocationRef.current = activeLocation;
  activeTypeRef.current = activeType;

  // Mirror context into the grid unless the user is mid-drag (which would clobber
  // the in-progress selection). Async Supabase loads land here too.
  useEffect(() => {
    if (draggingRef.current) return;
    const next = blocksToSlots(userBlocks);
    slotsRef.current = next;
    setSlots(next);
  }, [userBlocks]);

  const applySlots = (next: Map<string, SlotMeta>) => {
    slotsRef.current = next;
    setSlots(next);
  };

  const paint = (day: DayOfWeek, index: number) => {
    const [lo, hi] = dragAnchor.current <= index ? [dragAnchor.current, index] : [index, dragAnchor.current];
    const next = new Map(dragBase.current);
    for (let i = lo; i <= hi; i++) {
      const key = slotKey(day, i);
      if (dragMode.current === 'add') next.set(key, { location: activeLocationRef.current, type: activeTypeRef.current });
      else next.delete(key);
    }
    applySlots(next);
  };

  const cellFromPoint = (x: number, y: number): { day: DayOfWeek; index: number } | null => {
    const target = document.elementFromPoint(x, y) as HTMLElement | null;
    const cell = target?.closest<HTMLElement>('[data-day]');
    if (!cell || cell.dataset.day === undefined) return null;
    return { day: cell.dataset.day as DayOfWeek, index: Number(cell.dataset.index) };
  };

  const handlePointerDown = (event: ReactPointerEvent, day: DayOfWeek, index: number) => {
    event.preventDefault();
    gridRef.current?.setPointerCapture(event.pointerId);
    draggingRef.current = true;
    setDragging(true);
    dragDay.current = day;
    dragAnchor.current = index;
    dragBase.current = new Map(slotsRef.current);
    // Clicking a slot that already holds the active location + type clears it;
    // clicking anything else (empty, or a different location) repaints it.
    const existing = slotsRef.current.get(slotKey(day, index));
    dragMode.current =
      existing && existing.location === activeLocation && existing.type === activeType ? 'remove' : 'add';
    paint(day, index);
  };

  const handlePointerMove = (event: ReactPointerEvent) => {
    if (!draggingRef.current) return;
    const target = cellFromPoint(event.clientX, event.clientY);
    if (!target || target.day !== dragDay.current) return;
    paint(target.day, target.index);
  };

  const commitDay = (day: DayOfWeek) => {
    userBlocks.filter((block) => block.day === day).forEach((block) => removeAvailability(block.id));
    runsForDay(day, slotsRef.current).forEach((run) => {
      addAvailability({
        id: `av-${Date.now()}-${day}-${run.start}`,
        userId: currentUser.id,
        day,
        startTime: minToTime(slotStart(run.start)),
        endTime: minToTime(slotStart(run.end)),
        location: run.location,
        type: run.type,
      });
    });
  };

  const handlePointerUp = (event: ReactPointerEvent) => {
    if (!draggingRef.current) return;
    if (gridRef.current?.hasPointerCapture(event.pointerId)) {
      gridRef.current.releasePointerCapture(event.pointerId);
    }
    draggingRef.current = false;
    setDragging(false);
    const day = dragDay.current;
    dragDay.current = null;
    if (day) commitDay(day);
  };

  const clearWeek = () => {
    userBlocks.forEach((block) => removeAvailability(block.id));
    applySlots(new Map());
    showToast('Cleared your weekly availability.', 'info');
  };

  const totalHours = slots.size * (SLOT_MIN / 60);
  const daysCovered = DAYS.filter((day) => [...slots.keys()].some((key) => key.startsWith(`${day}|`))).length;
  const usedLocations = useMemo(
    () => [...new Set([...slots.values()].map((meta) => meta.location))].sort(),
    [slots],
  );
  const classmateBlocks = availability.filter((a) => a.userId !== currentUser.id && a.day === 'Monday');

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
            <h1 className="max-w-3xl text-4xl font-extrabold tracking-normal sm:text-5xl">Drag to set your campus availability.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-300">Pick where you&apos;ll be, then paint the times you&apos;re free across the week. BorrowBoard turns each block into match input — estimating handoff times and keeping requests realistic.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-4">
              <p className="text-2xl font-extrabold">{totalHours % 1 === 0 ? totalHours : totalHours.toFixed(1)}h</p>
              <p className="text-xs font-bold uppercase text-stone-400">Free time</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-4">
              <p className="text-2xl font-extrabold">{daysCovered}/{DAYS.length}</p>
              <p className="text-xs font-bold uppercase text-stone-400">Days covered</p>
            </div>
            <div className="col-span-2 rounded-2xl border border-white/10 bg-white/[0.08] p-4 sm:col-span-1">
              <Zap className="mb-2 h-4 w-4 text-amber-200" />
              <p className="text-xs font-bold uppercase text-stone-400">Live matching</p>
            </div>
          </div>
        </div>
      </section>

      {/* Location + period picker — what each painted block gets tagged with */}
      <div className="rounded-3xl border border-stone-950/10 bg-white/80 p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-8">
          <div className="flex-1">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
              <MapPin className="h-3.5 w-3.5" />
              Pickup location
            </p>
            <div className="flex flex-wrap gap-2">
              {LOCATIONS.map((location) => {
                const selected = location === activeLocation;
                return (
                  <button
                    key={location}
                    type="button"
                    onClick={() => setActiveLocation(location)}
                    className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-semibold transition-colors ${
                      selected
                        ? 'border-stone-950 bg-stone-950 text-white'
                        : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${LOCATION_DOT[locColor(location)]}`} />
                    {location}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Period</p>
            <div className="flex flex-wrap gap-2">
              {AVAILABILITY_TYPES.map((type) => {
                const selected = type === activeType;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setActiveType(type)}
                    className={`rounded-xl border px-3 py-1.5 text-sm font-semibold transition-colors ${
                      selected
                        ? 'border-stone-950 bg-stone-950 text-white'
                        : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    {typeLabel[type]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Weekly availability</h2>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
            <Hand className="h-3.5 w-3.5" />
            Click and drag down a day to mark free time at the selected location. Drag over matching slots to clear them.
          </p>
        </div>
        <button
          onClick={clearWeek}
          disabled={slots.size === 0}
          className="flex items-center justify-center gap-2 rounded-xl border border-stone-950/10 bg-white/80 px-4 py-2.5 text-sm font-semibold text-stone-800 transition-colors hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          Clear week
        </button>
      </div>

      {/* Drag-and-drop grid */}
      <div className="rounded-3xl border border-stone-950/10 bg-white/80 p-4 shadow-sm sm:p-5">
        <div
          ref={gridRef}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`grid select-none gap-px ${dragging ? 'cursor-grabbing' : 'cursor-pointer'}`}
          style={{ gridTemplateColumns: `64px repeat(${DAYS.length}, minmax(0, 1fr))`, touchAction: 'none' }}
        >
          <div className="pb-2" />
          {DAYS.map((day) => (
            <div key={day} className="pb-2 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
              <span className="sm:hidden">{day.slice(0, 3)}</span>
              <span className="hidden sm:inline">{day}</span>
            </div>
          ))}

          {Array.from({ length: SLOT_COUNT }).map((_, index) => (
            <Fragment key={index}>
              <div className="flex items-center justify-end pr-2 text-right text-[11px] font-medium text-slate-400">
                {index % 2 === 0 ? formatClock(slotStart(index)) : ''}
              </div>
              {DAYS.map((day) => {
                const meta = slots.get(slotKey(day, index));
                return (
                  <div
                    key={day}
                    data-day={day}
                    data-index={index}
                    title={meta ? `${meta.location} · ${typeLabel[meta.type]}` : undefined}
                    onPointerDown={(event) => handlePointerDown(event, day, index)}
                    className={`h-6 touch-none rounded-[5px] border transition-colors ${
                      meta
                        ? LOCATION_CELL[locColor(meta.location)]
                        : 'border-stone-950/[0.06] bg-stone-50 hover:bg-amber-100/60'
                    }`}
                  />
                );
              })}
            </Fragment>
          ))}
        </div>

        {usedLocations.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-stone-950/[0.06] pt-3 text-xs text-slate-500">
            <span className="font-bold uppercase tracking-wide">Locations in use</span>
            {usedLocations.map((location) => (
              <span key={location} className="flex items-center gap-1.5">
                <span className={`h-2.5 w-2.5 rounded-full ${LOCATION_DOT[locColor(location)]}`} />
                {location}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Others availability */}
      <div className="rounded-3xl border border-stone-950/10 bg-white/80 p-5 shadow-sm">
        <h2 className="mb-4 font-semibold text-slate-900">Classmates&apos; Availability (Monday)</h2>
        <div className="space-y-3">
          {classmateBlocks.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No classmate availability yet.</p>
          ) : (
            classmateBlocks.map((block) => (
              <div key={block.id} className="flex items-center gap-3 text-sm">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                  {block.userId[0].toUpperCase()}
                </div>
                <span className="font-medium capitalize text-slate-700">{block.userId}</span>
                <div className={`rounded-full px-2 py-0.5 text-xs ${typeColor[block.type] || 'bg-slate-100 text-slate-600'}`}>
                  {typeLabel[block.type] || block.type}
                </div>
                <span className="text-xs text-slate-500">{block.startTime}-{block.endTime}</span>
                <span className="ml-auto flex shrink-0 items-center gap-0.5 text-xs text-slate-400">
                  <MapPin className="h-3 w-3" />{block.location}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Calendar className="h-3.5 w-3.5" />
        Availability syncs to the match engine for {currentUser.name}.
      </div>
    </div>
  );
}
