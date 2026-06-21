'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, Item, BorrowRequest, Transaction, LostItem, FoundItem, AvailabilityBlock, CreditTransaction } from '@/lib/types';
import {
  MOCK_USERS,
  MOCK_ITEMS,
  MOCK_REQUESTS,
  MOCK_TRANSACTIONS,
  MOCK_LOST_ITEMS,
  MOCK_FOUND_ITEMS,
  MOCK_AVAILABILITY,
  MOCK_CREDIT_HISTORY,
} from '@/lib/mockData';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  currentUser: User;
  users: User[];
  items: Item[];
  requests: BorrowRequest[];
  transactions: Transaction[];
  lostItems: LostItem[];
  foundItems: FoundItem[];
  availability: AvailabilityBlock[];
  creditHistory: CreditTransaction[];
  toasts: Toast[];
  addItem: (item: Item) => void;
  addRequest: (request: BorrowRequest) => void;
  updateTransaction: (txnId: string, updates: Partial<Transaction>) => void;
  addTransaction: (txn: Transaction) => void;
  addLostItem: (item: LostItem) => void;
  addFoundItem: (item: FoundItem) => void;
  addAvailability: (block: AvailabilityBlock) => void;
  removeAvailability: (id: string) => void;
  addCredits: (amount: number, reason: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]);
  const [users] = useState<User[]>(MOCK_USERS);
  const [items, setItems] = useState<Item[]>(() => loadFromStorage('bb_items', MOCK_ITEMS));
  const [requests, setRequests] = useState<BorrowRequest[]>(() => loadFromStorage('bb_requests', MOCK_REQUESTS));
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadFromStorage('bb_transactions', MOCK_TRANSACTIONS));
  const [lostItems, setLostItems] = useState<LostItem[]>(() => loadFromStorage('bb_lost', MOCK_LOST_ITEMS));
  const [foundItems, setFoundItems] = useState<FoundItem[]>(() => loadFromStorage('bb_found', MOCK_FOUND_ITEMS));
  const [availability, setAvailability] = useState<AvailabilityBlock[]>(() => loadFromStorage('bb_avail', MOCK_AVAILABILITY));
  const [creditHistory, setCreditHistory] = useState<CreditTransaction[]>(() => loadFromStorage('bb_credits', MOCK_CREDIT_HISTORY));
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => { saveToStorage('bb_items', items); }, [items]);
  useEffect(() => { saveToStorage('bb_requests', requests); }, [requests]);
  useEffect(() => { saveToStorage('bb_transactions', transactions); }, [transactions]);
  useEffect(() => { saveToStorage('bb_lost', lostItems); }, [lostItems]);
  useEffect(() => { saveToStorage('bb_found', foundItems); }, [foundItems]);
  useEffect(() => { saveToStorage('bb_avail', availability); }, [availability]);
  useEffect(() => { saveToStorage('bb_credits', creditHistory); }, [creditHistory]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addItem = useCallback((item: Item) => {
    setItems((prev) => [item, ...prev]);
  }, []);

  const addRequest = useCallback((request: BorrowRequest) => {
    setRequests((prev) => [request, ...prev]);
  }, []);

  const updateTransaction = useCallback((txnId: string, updates: Partial<Transaction>) => {
    setTransactions((prev) => prev.map((t) => (t.id === txnId ? { ...t, ...updates } : t)));
  }, []);

  const addTransaction = useCallback((txn: Transaction) => {
    setTransactions((prev) => [txn, ...prev]);
  }, []);

  const addLostItem = useCallback((item: LostItem) => {
    setLostItems((prev) => [item, ...prev]);
  }, []);

  const addFoundItem = useCallback((item: FoundItem) => {
    setFoundItems((prev) => [item, ...prev]);
  }, []);

  const addAvailability = useCallback((block: AvailabilityBlock) => {
    setAvailability((prev) => [...prev, block]);
  }, []);

  const removeAvailability = useCallback((id: string) => {
    setAvailability((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const addCredits = useCallback((amount: number, reason: string) => {
    setCurrentUser((prev) => ({
      ...prev,
      credits: prev.credits + amount,
      trustScore: amount > 0 ? Math.min(100, prev.trustScore + 0.5) : prev.trustScore,
    }));
    const entry: CreditTransaction = {
      id: Math.random().toString(36).slice(2),
      userId: 'ayaan',
      amount,
      reason,
      type: amount > 0 ? 'earned' : 'spent',
      timestamp: new Date().toISOString(),
    };
    setCreditHistory((prev) => [entry, ...prev]);
  }, []);

  return (
    <AppContext.Provider value={{
      currentUser,
      users,
      items,
      requests,
      transactions,
      lostItems,
      foundItems,
      availability,
      creditHistory,
      toasts,
      addItem,
      addRequest,
      updateTransaction,
      addTransaction,
      addLostItem,
      addFoundItem,
      addAvailability,
      removeAvailability,
      addCredits,
      showToast,
      dismissToast,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
