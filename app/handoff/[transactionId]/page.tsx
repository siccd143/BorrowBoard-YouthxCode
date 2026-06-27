'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clipboard,
  Clock3,
  MapPin,
  PackageCheck,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { useApp } from '@/app/context/AppContext';
import { HandoffQrCode } from '@/components/HandoffQrCode';

type Condition = 'excellent' | 'good' | 'fair';

const conditionCopy: Record<Condition, string> = {
  excellent: 'Looks the same as checkout',
  good: 'Normal use, no issue',
  fair: 'Usable, but needs review',
};

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not set';

  return date.toLocaleString([], {
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StepButton({
  active,
  disabled,
  title,
  body,
  onClick,
}: {
  active: boolean;
  disabled?: boolean;
  title: string;
  body: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group rounded-3xl border p-4 text-left transition duration-300 ${
        active
          ? 'border-emerald-200 bg-emerald-50 shadow-[0_18px_45px_rgba(16,185,129,0.14)]'
          : disabled
          ? 'border-stone-100 bg-stone-50/50 opacity-60 cursor-not-allowed'
          : 'border-stone-200 bg-white/80 hover:-translate-y-0.5 hover:border-amber-200 hover:bg-amber-50/50'
      }`}
    >
      <div className="flex min-w-0 items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
            active ? 'bg-emerald-600 text-white' : 'bg-stone-950 text-amber-200'
          }`}
        >
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="font-extrabold text-stone-950">{title}</p>
          <p className="mt-1 text-xs leading-5 text-stone-500">{body}</p>
          {disabled && !active && (
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Locked (Role Restricted)</p>
          )}
        </div>
      </div>
    </button>
  );
}

export default function HandoffConfirmationPage() {
  const params = useParams();
  const rawTransactionId = params.transactionId;
  const transactionId = Array.isArray(rawTransactionId) ? rawTransactionId[0] : rawTransactionId;
  
  // Destructured currentUser alongside existing context functions
  const { currentUser, transactions, updateTransaction, addCredits, showToast } = useApp();
  const transaction = transactions.find((txn) => txn.id === transactionId);
  const [copied, setCopied] = useState(false);

  const handoffCode = transactionId ? `BB-${transactionId.slice(-6).toUpperCase()}` : 'BB-HANDOFF';

  // Extract synchronization states dynamically from the shared global transaction context
  const borrowerCheckout = !!transaction?.borrowerCheckout;
  const lenderCheckout = !!transaction?.lenderCheckout;
  const borrowerReturn = !!transaction?.borrowerReturn;
  const lenderReturn = !!transaction?.lenderReturn;
  const condition = (transaction?.condition as Condition) || 'good';
  const notes = transaction?.notes || '';

  const checkoutComplete = borrowerCheckout && lenderCheckout;
  const returnComplete = borrowerReturn && lenderReturn;

  // Verify roles based on names or potential unique IDs
  const isBorrower = currentUser && (currentUser.name === transaction?.borrowerName || currentUser.id === transaction?.borrowerId);
  const isLender = currentUser && (currentUser.name === transaction?.lenderName || currentUser.id === transaction?.lenderId);

  useEffect(() => {
    if (!transaction || !returnComplete || transaction.status === 'returned') return;

    // Securely update shared status and award credits once across the platform
    updateTransaction(transaction.id, {
      status: 'returned',
      returnTime: new Date().toISOString(),
      creditsAwarded: 15,
    });
    addCredits(15, `Return confirmed: ${transaction.itemName}`);
    showToast('Return confirmed. Credits awarded.', 'success');
  }, [addCredits, returnComplete, showToast, transaction, updateTransaction]);

  const toggle = (key: 'borrowerCheckout' | 'lenderCheckout' | 'borrowerReturn' | 'lenderReturn') => {
    if (!transaction) return;

    const isBorrowerField = key === 'borrowerCheckout' || key === 'borrowerReturn';
    const isLenderField = key === 'lenderCheckout' || key === 'lenderReturn';

    // Guard Clause: Prevent unauthorized button clicking
    if (isBorrowerField && !isBorrower) {
      showToast(`Access Denied: Only ${transaction.borrowerName} can confirm this action.`, 'error');
      return;
    }
    if (isLenderField && !isLender) {
      showToast(`Access Denied: Only ${transaction.lenderName} can confirm this action.`, 'error');
      return;
    }

    // Toggle real-time shared state
    updateTransaction(transaction.id, {
      [key]: !transaction[key],
    });
  };

  const copyLink = async () => {
    if (typeof window === 'undefined') return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      showToast('Handoff link copied', 'success');
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      showToast('Could not copy the link', 'error');
    }
  };

  if (!transaction) {
    return (
      <main className="min-h-screen overflow-x-hidden bg-[#f7f1e8] p-3 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-stone-200 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto h-10 w-10 text-amber-600" />
          <h1 className="mt-4 text-2xl font-black text-stone-950">Handoff not found</h1>
          <p className="mt-2 text-sm text-stone-500">This confirmation link does not match an active BorrowBoard transaction.</p>
          <Link href="/dashboard" className="mt-6 inline-flex rounded-full bg-stone-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-amber-700">
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f1e8] p-3 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-stone-600 transition hover:text-amber-700">
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>

        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-stone-950 text-white shadow-[0_28px_80px_rgba(28,25,23,0.18)]">
          <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="relative p-6 sm:p-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(245,158,11,0.24),transparent_34%),radial-gradient(circle_at_90%_10%,rgba(255,255,255,0.12),transparent_26%)]" />
              <div className="relative min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-200">Verified handoff</p>
                <h1 className="mt-3 max-w-2xl break-words text-3xl font-black tracking-normal text-white sm:text-5xl">{transaction.itemName}</h1>
                <p className="mt-4 max-w-xl text-sm leading-7 text-stone-300">
                  Both students confirm checkout, due time, return condition, and final return. This data synchronizes safely over your network.
                </p>

                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                    <MapPin className="h-5 w-5 text-amber-200" />
                    <p className="mt-3 text-xs font-bold uppercase tracking-wide text-stone-400">Pickup</p>
                    <p className="mt-1 break-words font-extrabold">{transaction.pickupLocation}</p>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                    <Clock3 className="h-5 w-5 text-amber-200" />
                    <p className="mt-3 text-xs font-bold uppercase tracking-wide text-stone-400">Due</p>
                    <p className="mt-1 break-words font-extrabold">{formatTime(transaction.dueTime)}</p>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                    <ShieldCheck className="h-5 w-5 text-amber-200" />
                    <p className="mt-3 text-xs font-bold uppercase tracking-wide text-stone-400">Status</p>
                    <p className="mt-1 break-words font-extrabold">{transaction.status === 'returned' ? 'Returned' : checkoutComplete ? 'Checked out' : 'Awaiting checkout'}</p>
                  </div>
                </div>
              </div>
            </div>

            <aside className="flex flex-col items-center justify-center gap-4 border-t border-white/10 bg-white/[0.07] p-6 text-center lg:border-l lg:border-t-0">
              <HandoffQrCode path={`/handoff/${transaction.id}`} size={184} className="max-w-full" />
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-200">Scan for checkout or return</p>
                <p className="mt-1 font-mono text-2xl font-black">{handoffCode}</p>
                <p className="mt-2 max-w-xs text-xs leading-5 text-stone-300">This QR opens the live sync page for accurate multi-party confirmations.</p>
              </div>
              <button
                type="button"
                onClick={copyLink}
                className="inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-stone-950 transition hover:bg-amber-100 sm:w-auto"
              >
                <Clipboard className="h-4 w-4" />
                {copied ? 'Copied' : 'Copy link'}
              </button>
            </aside>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-stone-200 bg-white/85 p-5 shadow-sm backdrop-blur">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-800">People</p>
            <div className="mt-4 grid gap-3">
              <div className="rounded-3xl bg-stone-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-stone-400">Borrower</p>
                <p className="mt-1 break-words text-lg font-black text-stone-950">{transaction.borrowerName}</p>
              </div>
              <div className="rounded-3xl bg-stone-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-stone-400">Lender</p>
                <p className="mt-1 break-words text-lg font-black text-stone-950">{transaction.lenderName}</p>
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-amber-100 bg-amber-50 p-4">
              <p className="flex items-center gap-2 text-sm font-black text-stone-950">
                <PackageCheck className="h-5 w-5 text-amber-700" />
                Item condition
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {(['excellent', 'good', 'fair'] as Condition[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      if (!isLender) {
                        showToast('Only the lender can adjust item condition settings.', 'error');
                        return;
                      }
                      updateTransaction(transaction.id, { condition: c });
                    }}
                    className={`rounded-2xl border px-3 py-3 text-left transition ${
                      condition === c
                        ? 'border-stone-950 bg-stone-950 text-white'
                        : 'border-stone-200 bg-white text-stone-700 hover:border-amber-300'
                    }`}
                  >
                    <p className="text-sm font-black capitalize">{c}</p>
                    <p className={`mt-1 text-[11px] leading-4 ${condition === c ? 'text-stone-300' : 'text-stone-500'}`}>
                      {conditionCopy[c]}
                    </p>
                  </button>
                ))}
              </div>
              <textarea
                value={notes}
                onChange={(event) => {
                  if (!isBorrower && !isLender) {
                    showToast('You are not authorized to add notes to this transaction.', 'error');
                    return;
                  }
                  updateTransaction(transaction.id, { notes: event.target.value });
                }}
                rows={3}
                placeholder="Optional notes for the handoff"
                className="mt-3 w-full resize-none rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
              />
            </div>
          </div>

          <div className="rounded-[2rem] border border-stone-200 bg-white/85 p-5 shadow-sm backdrop-blur">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-800">Confirmations</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <StepButton
                active={borrowerCheckout}
                disabled={!isBorrower}
                title="Borrower checkout"
                body={`${transaction.borrowerName} confirms they received the item.`}
                onClick={() => toggle('borrowerCheckout')}
              />
              <StepButton
                active={lenderCheckout}
                disabled={!isLender}
                title="Lender checkout"
                body={`${transaction.lenderName} confirms the item left in the stated condition.`}
                onClick={() => toggle('lenderCheckout')}
              />
              <StepButton
                active={borrowerReturn}
                disabled={!isBorrower}
                title="Borrower return"
                body={`${transaction.borrowerName} confirms they returned it.`}
                onClick={() => toggle('borrowerReturn')}
              />
              <StepButton
                active={lenderReturn}
                disabled={!isLender}
                title="Lender return"
                body={`${transaction.lenderName} confirms they received it back.`}
                onClick={() => toggle('lenderReturn')}
              />
            </div>

            <div className={`mt-5 rounded-3xl border p-4 ${returnComplete || transaction.status === 'returned' ? 'border-emerald-200 bg-emerald-50' : 'border-stone-200 bg-stone-50'}`}>
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${returnComplete || transaction.status === 'returned' ? 'bg-emerald-600 text-white' : 'bg-stone-950 text-amber-200'}`}>
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-black text-stone-950">
                    {returnComplete || transaction.status === 'returned' ? 'Return complete' : checkoutComplete ? 'Checkout verified' : 'Waiting for both checkout confirmations'}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-stone-500">
                    {returnComplete || transaction.status === 'returned'
                      ? 'BorrowBoard marked the item returned and awarded credits.'
                      : 'Both users must verify this page on their respective logged-in devices to finalize actions.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}