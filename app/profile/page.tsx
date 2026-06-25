'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, GraduationCap, IdCard, LogOut, MapPin, Save, School, UserRound } from 'lucide-react';
import { useApp } from '@/app/context/AppContext';
import UserAvatar from '@/components/UserAvatar';
import { createClient } from '@/utils/supabase/client';

const avatarOptions = [
  'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Man%20Student.png',
  'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Woman%20Student.png',
  'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Woman%20Technologist.png',
  'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Man%20Mechanic.png',
  'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Woman%20Teacher.png',
  'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Person%20With%20Blond%20Hair.png',
];

export default function ProfilePage() {
  const router = useRouter();
  const { currentUser, updateCurrentUser, locations } = useApp();
  const [name, setName] = useState(currentUser.name);
  const [grade, setGrade] = useState(currentUser.grade || 10);
  const [school, setSchool] = useState(currentUser.school || '');
  const [studentId, setStudentId] = useState(currentUser.studentId || '');
  const [pickupLocation, setPickupLocation] = useState(currentUser.pickupLocation);
  const [avatar, setAvatar] = useState(currentUser.avatar);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateCurrentUser({ name: name.trim() || currentUser.name, grade, school: school.trim(), studentId: studentId.trim(), pickupLocation, avatar });
  };

  const handleAvatarUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;
    if (!file.type.startsWith('image/')) return;

    if (file.size > 750_000) {
      window.alert('Choose an image under 750 KB for now.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setAvatar(reader.result);
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleSignOut = async () => {
    await createClient().auth.signOut();
    router.replace('/auth');
  };

  return (
    <div className="mx-auto max-w-5xl p-5 sm:p-8">
      <div className="relative overflow-hidden rounded-3xl border border-stone-950/10 bg-stone-950 p-6 text-white shadow-2xl shadow-stone-950/20 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(251,191,36,0.22),transparent_34%),radial-gradient(circle_at_82%_0%,rgba(99,102,241,0.16),transparent_30%)]" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-amber-100/70">Profile customization</p>
            <h1 className="mt-2 text-4xl font-extrabold tracking-normal">Make BorrowBoard feel like yours.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-300">Update your name, avatar, and default pickup spot across the dashboard, sidebar, credits, and borrowing flows.</p>
          </div>
          <UserAvatar avatar={avatar} name={name} className="h-24 w-24 bg-amber-50 ring-4 ring-white/15" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <section className="rounded-3xl border border-stone-950/10 bg-white/75 p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-950 text-amber-200">
              <UserRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-stone-950">Account details</h2>
              <p className="text-sm text-stone-500">These details show up around the app.</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-stone-500">Display name</span>
              <input value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full rounded-2xl border border-stone-950/10 bg-white px-4 py-3 text-sm font-semibold text-stone-950 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-200/40" />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-stone-500"><GraduationCap className="h-3.5 w-3.5" /> Grade</span>
                <select value={grade} onChange={(event) => setGrade(Number(event.target.value))} className="mt-2 w-full rounded-2xl border border-stone-950/10 bg-white px-4 py-3 text-sm font-semibold text-stone-950 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-200/40">
                  {[6, 7, 8, 9, 10, 11, 12].map((value) => <option key={value} value={value}>Grade {value}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-stone-500"><IdCard className="h-3.5 w-3.5" /> Student ID</span>
                <input value={studentId} onChange={(event) => setStudentId(event.target.value)} className="mt-2 w-full rounded-2xl border border-stone-950/10 bg-white px-4 py-3 text-sm font-semibold text-stone-950 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-200/40" placeholder="STU-10492" />
              </label>
            </div>

            <label className="block">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-stone-500"><School className="h-3.5 w-3.5" /> School</span>
              <input value={school} onChange={(event) => setSchool(event.target.value)} className="mt-2 w-full rounded-2xl border border-stone-950/10 bg-white px-4 py-3 text-sm font-semibold text-stone-950 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-200/40" placeholder="Westview High School" />
            </label>

            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-stone-500">Default pickup location</span>
              <div className="relative mt-2">
                <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <select value={pickupLocation} onChange={(event) => setPickupLocation(event.target.value)} className="w-full appearance-none rounded-2xl border border-stone-950/10 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-stone-950 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-200/40">
                  {locations.map((location) => <option key={location}>{location}</option>)}
                </select>
              </div>
            </label>
          </div>
        </section>

        <section className="rounded-3xl border border-stone-950/10 bg-white/75 p-6 shadow-sm">
          <h2 className="text-xl font-extrabold text-stone-950">Choose an avatar</h2>
          <p className="mt-1 text-sm text-stone-500">Pick the icon classmates see during requests and handoffs.</p>

          <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-3xl border border-dashed border-stone-950/15 bg-white p-4 transition hover:border-amber-400 hover:bg-amber-50/50">
            <input type="file" accept="image/*" onChange={handleAvatarUpload} className="sr-only" />
            <UserAvatar avatar={avatar} name={name} className="h-14 w-14 bg-amber-50 ring-1 ring-stone-950/10" />
            <span>
              <span className="block text-sm font-extrabold text-stone-950">Upload your own profile pic</span>
              <span className="mt-0.5 block text-xs font-semibold text-stone-500">PNG or JPG under 750 KB</span>
            </span>
          </label>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {avatarOptions.map((option) => (
              <button key={option} type="button" onClick={() => setAvatar(option)} className={`relative flex aspect-square items-center justify-center rounded-3xl border bg-white transition hover:-translate-y-1 hover:shadow-xl ${avatar === option ? 'border-amber-400 ring-4 ring-amber-200/50' : 'border-stone-950/10'}`}>
                <UserAvatar avatar={option} name="Avatar option" className="h-16 w-16 bg-amber-50" />
                {avatar === option && (
                  <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-stone-950 text-amber-200">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                )}
              </button>
            ))}
          </div>

          <button type="submit" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-stone-950 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-amber-700">
            <Save className="h-4 w-4" />
            Save profile
          </button>
          <button type="button" onClick={handleSignOut} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-stone-950/10 bg-white px-5 py-3 text-sm font-extrabold text-stone-950 transition hover:bg-stone-100">
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </section>
      </form>
    </div>
  );
}
