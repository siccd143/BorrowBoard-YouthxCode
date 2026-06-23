'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, BadgeCheck, CalendarCheck, GraduationCap, IdCard, School, Upload, UserRound } from 'lucide-react';
import { useApp } from '@/app/context/AppContext';
import { parseScheduleText } from '@/lib/scheduleUpload';

const grades = [6, 7, 8, 9, 10, 11, 12];

export default function OnboardingPage() {
  const router = useRouter();
  const { currentUser, updateCurrentUser, addAvailability, showToast } = useApp();
  const [name, setName] = useState(currentUser.name);
  const [grade, setGrade] = useState(currentUser.grade || 10);
  const [school, setSchool] = useState(currentUser.school || '');
  const [studentId, setStudentId] = useState(currentUser.studentId || '');
  const [pickupLocation, setPickupLocation] = useState(currentUser.pickupLocation || 'Library');
  const [importedBlocks, setImportedBlocks] = useState(0);

  const handleScheduleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!/\.(txt|csv)$/i.test(file.name)) {
      showToast('Upload a .txt or .csv schedule for now.', 'error');
      event.target.value = '';
      return;
    }

    const text = await file.text();
    const blocks = parseScheduleText(text, currentUser.id, pickupLocation);

    if (blocks.length === 0) {
      showToast('No schedule windows found. Try lines like Monday, 11:20 AM - 11:50 AM, Library, Lunch.', 'error');
      event.target.value = '';
      return;
    }

    blocks.forEach(addAvailability);
    setImportedBlocks((count) => count + blocks.length);
    showToast(`Imported ${blocks.length} schedule windows.`, 'success');
    event.target.value = '';
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateCurrentUser({
      name: name.trim() || currentUser.name,
      grade,
      school: school.trim(),
      studentId: studentId.trim(),
      pickupLocation,
    });
    router.push('/dashboard');
  };

  return (
    <main className="min-h-dvh overflow-x-hidden bg-[#120f0b] px-4 py-4 text-white sm:px-6 lg:py-5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(251,191,36,0.22),transparent_34%),radial-gradient(circle_at_82%_8%,rgba(99,102,241,0.20),transparent_30%)]" />
      <div className="relative mx-auto grid max-w-6xl items-start gap-5 lg:min-h-[calc(100dvh-2.5rem)] lg:grid-cols-[0.88fr_1fr] lg:items-center">
        <section>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-100/20 bg-white/[0.08] px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-100">
            <BadgeCheck className="h-3.5 w-3.5" />
            Campus verification
          </div>
          <h1 className="max-w-xl text-4xl font-extrabold leading-[0.98] tracking-normal sm:text-5xl xl:text-6xl">Set up your BorrowBoard profile.</h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-stone-300">
            These details help classmates verify handoffs, match by school context, and keep borrowing tied to real campus identity.
          </p>
        </section>

        <form onSubmit={handleSubmit} className="rounded-3xl border border-white/12 bg-white/[0.07] p-4 shadow-2xl shadow-black/35 backdrop-blur-2xl sm:p-5 lg:max-h-[calc(100dvh-3rem)] lg:overflow-y-auto">
          <div className="mb-4">
            <p className="text-xs font-extrabold uppercase tracking-wide text-amber-100/70">A few quick questions</p>
            <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">Finish your account</h2>
          </div>

          <div className="space-y-3">
            <label className="block">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-stone-300"><UserRound className="h-3.5 w-3.5" /> Full name</span>
              <input value={name} onChange={(event) => setName(event.target.value)} required className="mt-1.5 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-2.5 text-sm font-semibold text-white outline-none transition placeholder:text-stone-500 focus:border-amber-300 focus:ring-4 focus:ring-amber-200/15" placeholder="Ayaan Patel" />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-stone-300"><GraduationCap className="h-3.5 w-3.5" /> Grade</span>
                <select value={grade} onChange={(event) => setGrade(Number(event.target.value))} className="mt-1.5 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-2.5 text-sm font-semibold text-white outline-none transition focus:border-amber-300 focus:ring-4 focus:ring-amber-200/15">
                  {grades.map((value) => <option key={value} value={value}>Grade {value}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-stone-300"><IdCard className="h-3.5 w-3.5" /> Student ID</span>
                <input value={studentId} onChange={(event) => setStudentId(event.target.value)} required className="mt-1.5 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-2.5 text-sm font-semibold text-white outline-none transition placeholder:text-stone-500 focus:border-amber-300 focus:ring-4 focus:ring-amber-200/15" placeholder="STU-10492" />
              </label>
            </div>

            <label className="block">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-stone-300"><School className="h-3.5 w-3.5" /> School</span>
              <input value={school} onChange={(event) => setSchool(event.target.value)} required className="mt-1.5 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-2.5 text-sm font-semibold text-white outline-none transition placeholder:text-stone-500 focus:border-amber-300 focus:ring-4 focus:ring-amber-200/15" placeholder="Westview High School" />
            </label>

            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-stone-300">Default pickup spot</span>
              <select value={pickupLocation} onChange={(event) => setPickupLocation(event.target.value)} className="mt-1.5 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-2.5 text-sm font-semibold text-white outline-none transition focus:border-amber-300 focus:ring-4 focus:ring-amber-200/15">
                {['Library', 'Cafeteria', 'Room 210', 'STEM Lab', 'Gym', 'Main Office'].map((location) => <option key={location}>{location}</option>)}
              </select>
            </label>

            <label className="group block cursor-pointer rounded-3xl border border-dashed border-amber-100/25 bg-black/20 p-3 transition hover:border-amber-200/60 hover:bg-amber-100/[0.06]">
              <input type="file" accept=".txt,.csv,text/plain,text/csv" onChange={handleScheduleUpload} className="sr-only" />
              <span className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-stone-950 shadow-lg shadow-amber-500/20">
                  {importedBlocks > 0 ? <CalendarCheck className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-extrabold uppercase tracking-wide text-amber-100/75">Optional schedule import</span>
                  <span className="mt-1 block text-sm font-semibold text-white">
                    {importedBlocks > 0 ? `${importedBlocks} availability windows imported` : 'Upload a .txt or .csv schedule'}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-stone-400">
                    Example: Monday, 11:20 AM - 11:50 AM, Library, Lunch
                  </span>
                </span>
              </span>
            </label>
          </div>

          <button type="submit" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-sm font-extrabold text-stone-950 transition hover:bg-amber-100">
            Continue to dashboard
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </main>
  );
}
