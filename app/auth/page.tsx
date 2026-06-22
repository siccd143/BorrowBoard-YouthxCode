'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react';
import { useApp } from '@/app/context/AppContext';

function Typewriter({ words }: { words: string[] }) {
  const [wordIndex, setWordIndex] = useState(0);
  const [letterIndex, setLetterIndex] = useState(0);
  const current = words[wordIndex] || '';

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (letterIndex < current.length) {
        setLetterIndex((value) => value + 1);
      } else {
        window.setTimeout(() => {
          setLetterIndex(0);
          setWordIndex((value) => (value + 1) % words.length);
        }, 1100);
      }
    }, letterIndex < current.length ? 55 : 700);

    return () => window.clearTimeout(timeout);
  }, [current, letterIndex, words.length]);

  return (
    <span>
      {current.slice(0, letterIndex)}
      <span className="animate-pulse text-amber-200">|</span>
    </span>
  );
}

export default function AuthPage() {
  const router = useRouter();
  const { currentUser, updateCurrentUser, showToast } = useApp();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mode === 'signup' && name.trim()) {
      updateCurrentUser({ name: name.trim() });
    } else {
      showToast('Signed in to BorrowBoard', 'success');
    }
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#120f0b] text-white">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
        <section className="relative hidden overflow-hidden lg:block">
          <img
            src="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1600&q=80"
            alt="Students studying on campus"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,15,11,0.12),rgba(18,15,11,0.88)),radial-gradient(circle_at_18%_12%,rgba(251,191,36,0.35),transparent_34%)]" />
          <div className="relative flex h-full flex-col justify-between p-10">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-100 backdrop-blur-xl">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified school network
            </div>
            <div>
              <p className="mb-4 text-sm font-bold uppercase tracking-wide text-amber-100/75">BorrowBoard</p>
              <h1 className="max-w-xl text-6xl font-extrabold leading-[0.95] tracking-normal">
                <Typewriter words={['No charger. Quiz soon. BorrowBoard finds one.', 'Trusted handoffs before the bell.', 'Lost items find their way back.']} />
              </h1>
            </div>
          </div>
        </section>

        <section className="relative flex items-center justify-center overflow-hidden px-5 py-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_10%,rgba(251,191,36,0.20),transparent_28%),radial-gradient(circle_at_22%_80%,rgba(99,102,241,0.18),transparent_34%)]" />
          <div className="relative w-full max-w-md rounded-3xl border border-white/12 bg-white/[0.07] p-6 shadow-2xl shadow-black/35 backdrop-blur-2xl sm:p-8">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-stone-950 ring-1 ring-amber-100/20">
                <img src="/borrowboard-logo.png" alt="" className="h-full w-full object-cover" />
              </div>
              <p className="text-xs font-extrabold uppercase tracking-wide text-amber-100/70">{mode === 'signin' ? 'Welcome back' : 'Create your campus profile'}</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-normal">{mode === 'signin' ? 'Sign in to BorrowBoard' : 'Join BorrowBoard'}</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wide text-stone-300">Full name</span>
                  <input value={name} onChange={(event) => setName(event.target.value)} required className="mt-2 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-stone-500 focus:border-amber-300 focus:ring-4 focus:ring-amber-200/15" placeholder="Ayaan Patel" />
                </label>
              )}
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-stone-300">Email</span>
                <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required className="mt-2 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-stone-500 focus:border-amber-300 focus:ring-4 focus:ring-amber-200/15" placeholder="student@school.edu" />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-stone-300">Password</span>
                <div className="relative mt-2">
                  <input type={showPassword ? 'text' : 'password'} required className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 pr-12 text-sm font-semibold text-white outline-none transition placeholder:text-stone-500 focus:border-amber-300 focus:ring-4 focus:ring-amber-200/15" placeholder="Password" />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-stone-400 transition hover:bg-white/10 hover:text-white" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>

              <button type="submit" className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-stone-950 transition hover:bg-amber-100">
                {mode === 'signin' ? 'Sign in' : 'Create account'}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </button>
            </form>

            <div className="my-6 flex items-center gap-3 text-xs font-bold uppercase text-stone-500">
              <div className="h-px flex-1 bg-white/10" />
              Or continue with
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <button type="button" onClick={() => { showToast('Google sign in connected for demo', 'info'); router.push('/dashboard'); }} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-bold text-white transition hover:bg-white/[0.10]">
              <Sparkles className="h-4 w-4 text-amber-200" />
              Continue with school Google
            </button>

            <p className="mt-6 text-center text-sm text-stone-400">
              {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button type="button" onClick={() => setMode((value) => value === 'signin' ? 'signup' : 'signin')} className="font-bold text-amber-100 hover:underline">
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
