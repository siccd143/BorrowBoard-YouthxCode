'use client';

import { useState } from 'react';
import { useApp } from '@/app/context/AppContext';
import { CheckCircle2, Package, AlertCircle, QrCode, X, Clock3 } from 'lucide-react';
import { HandoffQrCode } from '@/components/HandoffQrCode';
import Link from 'next/link';

interface QRModalProps {
  transactionId: string;
  txnId: string;
  itemName: string;
  borrower: string;
  lender: string;
  location: string;
  dueTime: string;
  onClose: () => void;
  onConfirm: () => void; 
}

function QRModal({ transactionId, txnId, itemName, borrower, lender, location, dueTime, onClose, onConfirm }: QRModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/55 p-3 sm:p-4">
      <div className="my-4 w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider opacity-70">Handoff Checkout Card</span>
            <button onClick={onClose} className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs font-mono opacity-60 mb-2">{txnId}</p>
          <h3 className="text-lg font-bold">{itemName}</h3>
          <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
            <div><p className="opacity-60">Borrower</p><p className="font-semibold">{borrower}</p></div>
            <div><p className="opacity-60">Lender</p><p className="font-semibold">{lender}</p></div>
            <div><p className="opacity-60">Pickup</p><p className="font-semibold">{location}</p></div>
            <div><p className="opacity-60">Due By</p><p className="font-semibold">{new Date(dueTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p></div>
          </div>
          <div className="mt-4 flex justify-center">
            <HandoffQrCode path={`/handoff/${transactionId}?qr=1`} size={132} className="p-2" imageClassName="rounded-xl" />
          </div>
          <button onClick={onConfirm} className="mt-2 w-full bg-white/20 hover:bg-white/30 text-xs py-1 rounded">Test Confirm Action</button>
          <p className="mt-3 text-center text-[11px] font-semibold text-white/65">Scan to confirm checkout or return: {txnId}</p>
        </div>
        <div className="p-4">
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-center text-xs font-semibold text-amber-900">
            Signoff is locked to the QR scan. Use a device camera to open the confirmation page.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function TransactionPage() {
  const { transactions, currentUser } = useApp();
  const [qrModal, setQrModal] = useState<string | null>(null);
  
  const [confirmedCheckouts] = useState<Set<string>>(new Set());
  const showToast = (msg: string, type: string) => console.log(msg, type);
  const updateTransaction = (id: string, data: any) => console.log('Updating', id, data);

  const myTransactions = transactions.filter(
    (t) => t.borrowerId === currentUser.id || t.lenderId === currentUser.id
  );

  const handleConfirmReturn = (txnId: string, itemName: string) => {
    showToast(`Return confirmed. ${currentUser.name} earned 15 credits! 🎉`, 'success');
  };

  const handleConfirmCheckout = (txnId: string) => {
    showToast(`Checkout confirmed!`, 'success');
  };

  const statusBadge = (status: string, isOverdue: boolean) => {
    if (isOverdue) return 'bg-red-100 text-red-700';
    if (status === 'active') return 'bg-yellow-100 text-yellow-700';
    if (status === 'returned') return 'bg-green-100 text-green-700';
    return 'bg-slate-100 text-slate-600';
  };

  const statusLabel = (status: string, isOverdue: boolean) => {
    if (isOverdue) return 'Overdue';
    if (status === 'active') return 'Active';
    if (status === 'returned') return 'Returned';
    return status;
  };

  const qrTxn = transactions.find((t) => t.id === qrModal);

  return (
    <div className="mx-auto max-w-3xl space-y-5 overflow-x-hidden p-3 sm:p-6 lg:p-8">
      {qrTxn && qrModal && (
        <QRModal
          transactionId={qrModal}
          txnId={`TXN-${qrModal.slice(-6).toUpperCase()}`}
          itemName={qrTxn.itemName}
          borrower={qrTxn.borrowerName}
          lender={qrTxn.lenderName}
          location={qrTxn.pickupLocation}
          dueTime={qrTxn.dueTime}
          onClose={() => setQrModal(null)}
          onConfirm={() => handleConfirmCheckout(qrModal)}
        />
      )}

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
        <p className="text-slate-500 text-sm mt-0.5">{myTransactions.length} total transactions</p>
      </div>

      {myTransactions.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center sm:p-12">
          <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-600 mb-1">No transactions yet</p>
          <p className="text-sm text-slate-400">Request or lend an item to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {myTransactions.map((txn) => {
            const isOverdue = txn.status === 'active' && new Date(txn.dueTime) < new Date();
            const isBorrower = txn.borrowerId === currentUser.id;
            const isCheckedOut = confirmedCheckouts.has(txn.id);

            return (
              <div key={txn.id} className={`min-w-0 rounded-2xl border bg-white p-4 shadow-sm sm:p-5 ${isOverdue ? 'border-red-200' : 'border-slate-100'}`}>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="min-w-0">
                    <h3 className="break-words font-bold text-slate-900">{txn.itemName}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isBorrower ? `Borrowed from ${txn.lenderName}` : `Lent to ${txn.borrowerName}`}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${statusBadge(txn.status, isOverdue)}`}>
                    {statusLabel(txn.status, isOverdue)}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mb-4">
                  <div className="min-w-0 rounded-lg bg-slate-50 p-2">
                    <p className="text-slate-400 mb-0.5">Checkout</p>
                    <p className="font-semibold text-slate-800">
                      {new Date(txn.checkoutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className={`min-w-0 rounded-lg p-2 ${isOverdue ? 'bg-red-50' : 'bg-slate-50'}`}>
                    <p className={`mb-0.5 ${isOverdue ? 'text-red-400' : 'text-slate-400'}`}>Due By</p>
                    <p className={`font-semibold ${isOverdue ? 'text-red-700' : 'text-slate-800'}`}>
                      {new Date(txn.dueTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="min-w-0 rounded-lg bg-slate-50 p-2">
                    <p className="text-slate-400 mb-0.5">Location</p>
                    <p className="break-words font-semibold text-slate-800">{txn.pickupLocation}</p>
                  </div>
                  <div className="min-w-0 rounded-lg bg-slate-50 p-2">
                    <p className="text-slate-400 mb-0.5">
                      {txn.status === 'returned' ? 'Credits' : 'Role'}
                    </p>
                    <p className="font-semibold text-slate-800">
                      {txn.status === 'returned' ? `+${txn.creditsAwarded || 15}` : isBorrower ? 'Borrower' : 'Lender'}
                    </p>
                  </div>
                </div>

                {isOverdue && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-4">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <p className="text-xs text-red-700 font-medium">This item is overdue. Late return will deduct 10 credits.</p>
                  </div>
                )}

                {txn.status === 'returned' && (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    <p className="text-xs text-green-700 font-medium">
                      Returned at {txn.returnTime ? new Date(txn.returnTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}.
                      {txn.creditsAwarded ? ` +${txn.creditsAwarded} credits earned.` : ''}
                    </p>
                  </div>
                )}

                {txn.status === 'active' && (
                  <div className="flex flex-col gap-2 mt-1 sm:flex-row">
                    <button
                      onClick={() => setQrModal(txn.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-semibold py-2.5 rounded-xl transition-colors cursor-pointer"
                    >
                      <QrCode className="w-4 h-4" />
                      {isCheckedOut ? 'View code' : 'Checkout code'}
                    </button>
                    <Link
                      href={`/handoff/${txn.id}`}
                      className="flex-1 flex items-center justify-center gap-2 bg-slate-950 hover:bg-amber-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Confirm
                    </Link>
                    <button
                      onClick={() => {
                        if (isBorrower) {
                          updateTransaction(txn.id, { status: 'returned', returnTime: new Date().toISOString() });
                          showToast('Marked as returned. Awaiting lender confirmation.', 'info');
                        } else {
                          handleConfirmReturn(txn.id, txn.itemName);
                        }
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-xl transition-colors cursor-pointer ${
                        isBorrower
                          ? 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      <Clock3 className="w-4 h-4" />
                      {isBorrower ? 'Mark Returned' : 'Confirm Return'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}