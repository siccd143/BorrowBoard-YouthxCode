'use client';

import { Fragment, PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '@/app/context/AppContext';
import { AvailabilityBlock, AvailabilityType, DAYS, DayOfWeek } from '@/lib/types';
import { Calendar, Hand, MapPin, Sparkles, Trash2, Zap } from 'lucide-react';

// Weekly grid: 7:30 AM -> 4:00 PM in 30-minute slots. Dragging across a day's
// column paints availability directly, so there are no block forms or schedule
// files to parse — a contiguous run of painted slots becomes one block.
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

// A painted run only knows its time of day; label it automatically so the
// classmate view stays readable without asking students to pick a type.
function inferType(startMin: number): AvailabilityType {
  if (startMin < 8 * 60) return 'before-school';
  if (startMin >= 15 * 60) return 'after-school';
  if (startMin >= 11 * 60 && startMin < 13 * 60 + 30) return 'lunch';
  return 'free-period';
}

function blocksToSlots(blocks: AvailabilityBlock[]): Set<string> {
  const set = new Set<string>();
  for (const block of blocks) {
    const from = Math.max(0, Math.round((timeToMin(block.startTime) - START_MIN) / SLOT_MIN));
    const to = Math.min(SLOT_COUNT, Math.round((timeToMin(block.endTime) - START_MIN) / SLOT_MIN));
    for (let i = from; i < to; i++) set.add(slotKey(block.day, i));
  }
  return set;
}

function runsForDay(day: DayOfWeek, slots: Set<string>): Array<{ start: number; end: number }> {
  const indices = [...slots]
    .filter((key) => key.startsWith(`${day}|`))
    .map((key) => Number(key.split('|')[1]))
    .sort((a, b) => a - b);

  const runs: Array<{ start: number; end: number }> = [];
  for (const index of indices) {
    const last = runs[runs.length - 1];
    if (last && index === last.end) last.end = index + 1;
    else runs.push({ start: index, end: index + 1 });
  }
  return runs;
}

export default function SchedulePage() {
  const { availability, addAvailability, removeAvailability, currentUser, showToast } = useApp();

  const userBlocks = useMemo(
    () => availability.filter((a) => a.userId === currentUser.id),
    [availability, currentUser.id],
  );

  const [slots, setSlots] = useState<Set<string>>(() => blocksToSlots(userBlocks));
  const [dragging, setDragging] = useState(false);

  const gridRef = useRef<HTMLDivElement>(null);
  const slotsRef = useRef(slots);
  const draggingRef = useRef(false);
  const dragDay = useRef<DayOfWeek | null>(null);
  const dragMode = useRef<'add' | 'remove'>('add');
  const dragAnchor = useRef(0);
  const dragBase = useRef<Set<string>>(new Set());

  // Mirror context into the grid unless the user is mid-drag (which would clobber
  // the in-progress selection). Async Supabase loads land here too.
  useEffect(() => {
    if (draggingRef.current) return;
    const next = blocksToSlots(userBlocks);
    slotsRef.current = next;
    setSlots(next);
  }, [userBlocks]);

  const applySlots = (next: Set<string>) => {
    slotsRef.current = next;
    setSlots(next);
  };

  const paint = (day: DayOfWeek, index: number) => {
    const [lo, hi] = dragAnchor.current <= index ? [dragAnchor.current, index] : [index, dragAnchor.current];
    const next = new Set(dragBase.current);
    for (let i = lo; i <= hi; i++) {
      const key = slotKey(day, i);
      if (dragMode.current === 'add') next.add(key);
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
    dragBase.current = new Set(slotsRef.current);
    dragMode.current = slotsRef.current.has(slotKey(day, index)) ? 'remove' : 'add';
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
      const start = slotStart(run.start);
      addAvailability({
        id: `av-${Date.now()}-${day}-${run.start}`,
        userId: currentUser.id,
        day,
        startTime: minToTime(start),
        endTime: minToTime(slotStart(run.end)),
        location: currentUser.pickupLocation,
        type: inferType(start),
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
    applySlots(new Set());
    showToast('Cleared your weekly availability.', 'info');
  };

  const totalHours = slots.size * (SLOT_MIN / 60);
  const daysCovered = DAYS.filter((day) => [...slots].some((key) => key.startsWith(`${day}|`))).length;
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
            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-300">Paint the times you&apos;re free across the week. BorrowBoard turns each block into match input — estimating handoff times and keeping requests realistic.</p>
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

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Weekly availability</h2>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
            <Hand className="h-3.5 w-3.5" />
            Click and drag down a day to mark free time. Drag over filled slots to clear them.
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
                const active = slots.has(slotKey(day, index));
                return (
                  <div
                    key={day}
                    data-day={day}
                    data-index={index}
                    onPointerDown={(event) => handlePointerDown(event, day, index)}
                    className={`h-6 touch-none rounded-[5px] border transition-colors ${
                      active
                        ? 'border-amber-300 bg-gradient-to-br from-amber-300 to-amber-400 shadow-sm shadow-amber-500/20'
                        : 'border-stone-950/[0.06] bg-stone-50 hover:bg-amber-100/60'
                    }`}
                  />
                );
              })}
            </Fragment>
          ))}
        </div>
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
