'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useApp } from '@/app/context/AppContext';
import { createClient } from '@/utils/supabase/client';
import { getPostAuthPath } from '@/lib/authRedirect';

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

function MicrosoftLogo() {
  return (
    <span className="grid h-4 w-4 grid-cols-2 gap-0.5" aria-hidden="true">
      <span className="bg-[#f25022]" />
      <span className="bg-[#7fba00]" />
      <span className="bg-[#00a4ef]" />
      <span className="bg-[#ffb900]" />
    </span>
  );
}

export default function AuthPage() {
  const router = useRouter();
  const { currentUser, showToast } = useApp();
  const supabase = useMemo(() => createClient(), []);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        getPostAuthPath(supabase, data.session.user.id).then((path) => router.replace(path));
      }
    });
  }, [router, supabase]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name.trim() || email.split('@')[0],
            },
          },
        });
        if (error) throw error;

        if (data.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            name: name.trim() || email.split('@')[0],
            email,
            grade: '10',
            avatar: 'gradient-amber',
            trust_score: 88,
            credits: 120,
            pickup_location: 'Library',
          });
        }

        if (!data.session) {
          showToast('Account created. Check your email to confirm, then sign in.', 'info');
          setMode('signin');
          return;
        }

        showToast('Account created. Welcome to BorrowBoard.', 'success');
        router.push('/onboarding');
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      showToast('Signed in to BorrowBoard', 'success');
      router.push(data.user ? await getPostAuthPath(supabase, data.user.id) : '/onboarding');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not sign in. Try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMicrosoft = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        redirectTo: `${window.location.origin}/auth`,
        scopes: 'openid profile email User.Read',
      },
    });

    if (error) showToast(error.message, 'error');
  };

  return (
    <div className="min-h-dvh overflow-x-hidden bg-[#120f0b] text-white">
      <div className="mx-auto grid min-h-dvh w-full max-w-[1500px] lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,1fr)]">
        <section className="relative hidden min-w-0 overflow-hidden lg:block">
          <img
            src="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1600&q=80"
            alt="Students studying on campus"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,15,11,0.12),rgba(18,15,11,0.88)),radial-gradient(circle_at_18%_12%,rgba(251,191,36,0.35),transparent_34%)]" />
          <div className="relative flex h-full min-h-0 flex-col justify-between p-8 xl:p-10">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-100 backdrop-blur-xl">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified school network
            </div>
            <div>
              <p className="mb-4 text-sm font-bold uppercase tracking-wide text-amber-100/75">BorrowBoard</p>
              <h1 className="max-w-xl break-words text-5xl font-extrabold leading-[0.98] tracking-normal xl:text-6xl">
                <Typewriter words={['No charger. Quiz soon. BorrowBoard finds one.', 'Trusted handoffs before the bell.', 'Lost items find their way back.']} />
              </h1>
            </div>
          </div>
        </section>

        <section className="relative flex min-w-0 items-start justify-center overflow-visible px-4 py-4 sm:px-6 sm:py-5 lg:items-center lg:px-8 lg:py-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_10%,rgba(251,191,36,0.20),transparent_28%),radial-gradient(circle_at_22%_80%,rgba(99,102,241,0.18),transparent_34%)]" />
          <div className="relative w-full max-w-[400px] rounded-3xl border border-white/12 bg-white/[0.07] p-4 shadow-2xl shadow-black/35 backdrop-blur-2xl sm:p-5">
            <div className="mb-4 text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-stone-950 ring-1 ring-amber-100/20">
                <img src="/borrowboard-logo.png" alt="" className="h-full w-full object-cover" />
              </div>
              <p className="text-xs font-extrabold uppercase tracking-wide text-amber-100/70">{mode === 'signin' ? 'Welcome back' : 'Create your campus profile'}</p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-normal sm:text-3xl">{mode === 'signin' ? 'Sign in to BorrowBoard' : 'Join BorrowBoard'}</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === 'signup' && (
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wide text-stone-300">Full name</span>
                  <input value={name} onChange={(event) => setName(event.target.value)} required className="mt-2 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-2.5 text-sm font-semibold text-white outline-none transition placeholder:text-stone-500 focus:border-amber-300 focus:ring-4 focus:ring-amber-200/15" placeholder="Ayaan Patel" />
                </label>
              )}
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-stone-300">Email</span>
                <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required className="mt-2 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-2.5 text-sm font-semibold text-white outline-none transition placeholder:text-stone-500 focus:border-amber-300 focus:ring-4 focus:ring-amber-200/15" placeholder="student@school.edu" />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-stone-300">Password</span>
                <div className="relative mt-2">
                  <input value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? 'text' : 'password'} required minLength={6} className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-2.5 pr-12 text-sm font-semibold text-white outline-none transition placeholder:text-stone-500 focus:border-amber-300 focus:ring-4 focus:ring-amber-200/15" placeholder="Password" />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-stone-400 transition hover:bg-white/10 hover:text-white" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>

              <button type="submit" disabled={isSubmitting} className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-sm font-extrabold text-stone-950 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-70">
                {isSubmitting ? 'Working...' : mode === 'signin' ? 'Sign in' : 'Create account'}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </button>
            </form>

            <div className="my-4 flex items-center gap-3 text-xs font-bold uppercase text-stone-500">
              <div className="h-px flex-1 bg-white/10" />
              Or continue with
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <button type="button" onClick={handleMicrosoft} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/[0.10]">
              <MicrosoftLogo />
              Continue with Microsoft
            </button>

            <p className="mt-4 text-center text-sm text-stone-400">
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
