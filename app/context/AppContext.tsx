'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { User, Item, BorrowRequest, Transaction, LostItem, FoundItem, AvailabilityBlock, CreditTransaction, LOCATIONS } from '@/lib/types';
import { createClient } from '@/utils/supabase/client';
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
  locations: string[];
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
  updateCurrentUser: (updates: Partial<Pick<User, 'name' | 'avatar' | 'pickupLocation' | 'grade' | 'school' | 'studentId'>>) => void;
  isSupabaseReady: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

type DbRow = Record<string, any>;

const isUuid = (value?: string) => Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));

const defaultBadges = MOCK_USERS[0].badges;

function toUser(row: DbRow): User {
  return {
    id: row.id,
    name: row.name || 'BorrowBoard Student',
    grade: Number.parseInt(String(row.grade || '10'), 10) || 10,
    trustScore: row.trust_score ?? 88,
    credits: row.credits ?? 120,
    pickupLocation: row.pickup_location || 'Library',
    school: row.school || '',
    studentId: row.student_id || '',
    avatar: row.avatar || 'gradient-amber',
    itemsLent: row.items_lent ?? 0,
    itemsBorrowed: row.items_borrowed ?? 0,
    onTimeReturns: row.on_time_returns ?? 0,
    badges: defaultBadges,
  };
}

function toItem(row: DbRow, owner?: User): Item {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description || '',
    condition: row.condition || 'good',
    ownerId: row.owner_id,
    ownerName: owner?.name || row.owner_name || 'BorrowBoard Student',
    ownerTrustScore: owner?.trustScore || row.owner_trust_score || 88,
    pickupLocation: row.pickup_location || 'Library',
    availableDays: row.available_days || [],
    availableStart: String(row.available_start || '11:20').slice(0, 5),
    availableEnd: String(row.available_end || '11:50').slice(0, 5),
    availabilityLabel: `${(row.available_days || []).join(', ')} ${String(row.available_start || '11:20').slice(0, 5)}-${String(row.available_end || '11:50').slice(0, 5)}`,
    isExpensive: Boolean(row.is_expensive),
    rules: row.rules || undefined,
    isAvailable: row.is_available ?? true,
    listedAt: row.created_at || new Date().toISOString(),
  };
}

function toAvailability(row: DbRow): AvailabilityBlock {
  return {
    id: row.id,
    userId: row.user_id,
    day: row.day,
    startTime: String(row.start_time || '11:20').slice(0, 5),
    endTime: String(row.end_time || '11:50').slice(0, 5),
    location: row.location || 'Library',
    type: row.type || 'lunch',
  };
}

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
  const supabase = useMemo(() => createClient(), []);
  const [currentUser, setCurrentUser] = useState<User>(() => loadFromStorage('bb_current_user', MOCK_USERS[0]));
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [items, setItems] = useState<Item[]>(() => loadFromStorage('bb_items', MOCK_ITEMS));
  const [requests, setRequests] = useState<BorrowRequest[]>(() => loadFromStorage('bb_requests', MOCK_REQUESTS));
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadFromStorage('bb_transactions', MOCK_TRANSACTIONS));
  const [lostItems, setLostItems] = useState<LostItem[]>(() => loadFromStorage('bb_lost', MOCK_LOST_ITEMS));
  const [foundItems, setFoundItems] = useState<FoundItem[]>(() => loadFromStorage('bb_found', MOCK_FOUND_ITEMS));
  const [availability, setAvailability] = useState<AvailabilityBlock[]>(() => loadFromStorage('bb_avail', MOCK_AVAILABILITY));
  const [creditHistory, setCreditHistory] = useState<CreditTransaction[]>(() => loadFromStorage('bb_credits', MOCK_CREDIT_HISTORY));
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isSupabaseReady, setIsSupabaseReady] = useState(false);

  useEffect(() => { saveToStorage('bb_items', items); }, [items]);
  useEffect(() => { saveToStorage('bb_current_user', currentUser); }, [currentUser]);
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

  const loadSupabaseData = useCallback(async (profileUser: User) => {
    const [profilesRes, itemsRes, availabilityRes, requestsRes, transactionsRes, lostRes, foundRes, creditsRes] = await Promise.all([
      supabase.from('profiles').select('*'),
      supabase.from('items').select('*').order('created_at', { ascending: false }),
      supabase.from('availability_blocks').select('*'),
      supabase.from('borrow_requests').select('*').order('created_at', { ascending: false }),
      supabase.from('transactions').select('*').order('created_at', { ascending: false }),
      supabase.from('lost_items').select('*').order('reported_at', { ascending: false }),
      supabase.from('found_items').select('*').order('reported_at', { ascending: false }),
      supabase.from('credit_history').select('*').order('created_at', { ascending: false }),
    ]);

    const dbUsers = profilesRes.data?.map(toUser) || [];
    const allUsers = dbUsers.length ? dbUsers : [profileUser, ...MOCK_USERS.filter((user) => user.id !== profileUser.id)];
    setUsers(allUsers);

    if (itemsRes.data) setItems(itemsRes.data.map((row) => toItem(row, allUsers.find((user) => user.id === row.owner_id))));
    if (availabilityRes.data) setAvailability(availabilityRes.data.map(toAvailability));
    if (requestsRes.data) {
      setRequests(requestsRes.data.map((row) => ({
        id: row.id,
        requesterId: row.requester_id,
        requesterName: allUsers.find((user) => user.id === row.requester_id)?.name || profileUser.name,
        itemCategory: row.item_category,
        itemName: row.item_name,
        day: row.day,
        startTime: String(row.start_time || '11:20').slice(0, 5),
        endTime: String(row.end_time || '11:50').slice(0, 5),
        period: row.period || '',
        urgency: row.urgency || 'normal',
        preferredLocation: row.preferred_location || 'Library',
        notes: row.notes || undefined,
        status: row.status || 'pending',
        createdAt: row.created_at,
      })));
    }
    if (transactionsRes.data) {
      setTransactions(transactionsRes.data.map((row) => ({
        id: row.id,
        itemId: row.item_id || '',
        itemName: row.item_name,
        borrowerId: row.borrower_id,
        borrowerName: allUsers.find((user) => user.id === row.borrower_id)?.name || 'Borrower',
        lenderId: row.lender_id,
        lenderName: allUsers.find((user) => user.id === row.lender_id)?.name || 'Lender',
        checkoutTime: row.checkout_time,
        dueTime: row.due_time,
        returnTime: row.return_time || undefined,
        status: row.status || 'active',
        pickupLocation: row.pickup_location || 'Library',
      })));
    }
    if (lostRes.data) {
      setLostItems(lostRes.data.map((row) => ({
        id: row.id,
        reporterId: row.reporter_id,
        reporterName: allUsers.find((user) => user.id === row.reporter_id)?.name || 'Student',
        itemName: row.item_name,
        category: row.category || 'other',
        description: row.description || '',
        lastSeenLocation: row.last_seen_location || '',
        timeLost: row.time_lost || row.reported_at,
        uniqueDetail: row.unique_detail || '',
        status: row.status || 'active',
        reportedAt: row.reported_at,
      })));
    }
    if (foundRes.data) {
      setFoundItems(foundRes.data.map((row) => ({
        id: row.id,
        reporterId: row.reporter_id,
        reporterName: allUsers.find((user) => user.id === row.reporter_id)?.name || 'Student',
        itemName: row.item_name,
        category: row.category || 'other',
        description: row.description || '',
        locationFound: row.location_found || '',
        timeFound: row.time_found || row.reported_at,
        verificationDetail: row.verification_detail || '',
        status: row.status || 'unclaimed',
        reportedAt: row.reported_at,
      })));
    }
    if (creditsRes.data) {
      setCreditHistory(creditsRes.data.map((row) => ({
        id: row.id,
        userId: row.user_id,
        amount: row.amount,
        reason: row.reason,
        type: row.type,
        timestamp: row.created_at,
      })));
    }
  }, [supabase]);

  useEffect(() => {
    let mounted = true;

    const syncAuthProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!mounted) return;

      if (!user) {
        setIsSupabaseReady(true);
        return;
      }

      const email = user.email || '';
      const fallbackName = user.user_metadata?.full_name || user.user_metadata?.name || email.split('@')[0] || 'BorrowBoard Student';
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      let profileUser: User;
      if (profile) {
        profileUser = toUser(profile);
      } else {
        const { data: createdProfile } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            name: fallbackName,
            email,
            grade: '10',
            avatar: 'gradient-amber',
            trust_score: 88,
            credits: 120,
            pickup_location: 'Library',
          })
          .select()
          .single();
        profileUser = createdProfile ? toUser(createdProfile) : { ...MOCK_USERS[0], id: user.id, name: fallbackName };
      }

      setCurrentUser(profileUser);
      await loadSupabaseData(profileUser);
      if (mounted) setIsSupabaseReady(true);
    };

    syncAuthProfile();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      syncAuthProfile();
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [loadSupabaseData, supabase]);

  const addItem = useCallback((item: Item) => {
    setItems((prev) => [item, ...prev]);
    supabase
      .from('items')
      .insert({
        owner_id: item.ownerId,
        name: item.name,
        category: item.category,
        description: item.description,
        condition: item.condition,
        pickup_location: item.pickupLocation,
        available_days: item.availableDays,
        available_start: item.availableStart,
        available_end: item.availableEnd,
        is_expensive: item.isExpensive,
        rules: item.rules,
        is_available: item.isAvailable,
      })
      .select()
      .single()
      .then(({ data }) => {
        if (data) setItems((prev) => prev.map((existing) => existing.id === item.id ? toItem(data, currentUser) : existing));
      });
  }, [currentUser, supabase]);

  const addRequest = useCallback((request: BorrowRequest) => {
    setRequests((prev) => [request, ...prev]);
    supabase.from('borrow_requests').insert({
      requester_id: request.requesterId,
      item_category: request.itemCategory,
      item_name: request.itemName,
      day: request.day,
      start_time: request.startTime,
      end_time: request.endTime,
      period: request.period,
      urgency: request.urgency,
      preferred_location: request.preferredLocation,
      notes: request.notes,
      status: request.status,
    }).then(() => {});
  }, [supabase]);

  const updateTransaction = useCallback((txnId: string, updates: Partial<Transaction>) => {
    setTransactions((prev) => prev.map((t) => (t.id === txnId ? { ...t, ...updates } : t)));
    if (!isUuid(txnId)) return;

    const dbUpdates = {
      ...(updates.itemId !== undefined ? { item_id: isUuid(updates.itemId) ? updates.itemId : null } : {}),
      ...(updates.itemName !== undefined ? { item_name: updates.itemName } : {}),
      ...(updates.borrowerId !== undefined ? { borrower_id: updates.borrowerId } : {}),
      ...(updates.lenderId !== undefined ? { lender_id: updates.lenderId } : {}),
      ...(updates.checkoutTime !== undefined ? { checkout_time: updates.checkoutTime } : {}),
      ...(updates.dueTime !== undefined ? { due_time: updates.dueTime } : {}),
      ...(updates.returnTime !== undefined ? { return_time: updates.returnTime } : {}),
      ...(updates.status !== undefined ? { status: updates.status } : {}),
      ...(updates.pickupLocation !== undefined ? { pickup_location: updates.pickupLocation } : {}),
    };

    if (Object.keys(dbUpdates).length === 0) return;

    supabase.from('transactions').update(dbUpdates).eq('id', txnId).then(() => {});
  }, [supabase]);

  const addTransaction = useCallback((txn: Transaction) => {
    setTransactions((prev) => [txn, ...prev]);
    supabase.from('transactions').insert({
      item_id: isUuid(txn.itemId) ? txn.itemId : null,
      item_name: txn.itemName,
      borrower_id: txn.borrowerId,
      lender_id: txn.lenderId,
      checkout_time: txn.checkoutTime,
      due_time: txn.dueTime,
      status: txn.status,
      pickup_location: txn.pickupLocation,
    }).then(() => {});
  }, [supabase]);

  const addLostItem = useCallback((item: LostItem) => {
    setLostItems((prev) => [item, ...prev]);
    supabase.from('lost_items').insert({
      reporter_id: item.reporterId,
      item_name: item.itemName,
      category: item.category,
      description: item.description,
      last_seen_location: item.lastSeenLocation,
      time_lost: item.timeLost,
      unique_detail: item.uniqueDetail,
      status: item.status,
    }).then(() => {});
  }, [supabase]);

  const addFoundItem = useCallback((item: FoundItem) => {
    setFoundItems((prev) => [item, ...prev]);
    supabase.from('found_items').insert({
      reporter_id: item.reporterId,
      item_name: item.itemName,
      category: item.category,
      description: item.description,
      location_found: item.locationFound,
      time_found: item.timeFound,
      verification_detail: item.verificationDetail,
      status: item.status,
    }).then(() => {});
  }, [supabase]);

  const addAvailability = useCallback((block: AvailabilityBlock) => {
    setAvailability((prev) => [...prev, block]);
    supabase
      .from('availability_blocks')
      .insert({
        user_id: block.userId,
        day: block.day,
        start_time: block.startTime,
        end_time: block.endTime,
        location: block.location,
        type: block.type,
      })
      .select()
      .single()
      .then(({ data }) => {
        if (data) setAvailability((prev) => prev.map((existing) => existing.id === block.id ? toAvailability(data) : existing));
      });
  }, [supabase]);

  const removeAvailability = useCallback((id: string) => {
    setAvailability((prev) => prev.filter((a) => a.id !== id));
    if (isUuid(id)) supabase.from('availability_blocks').delete().eq('id', id).then(() => {});
  }, [supabase]);

  const addCredits = useCallback((amount: number, reason: string) => {
    setCurrentUser((prev) => ({
      ...prev,
      credits: prev.credits + amount,
      trustScore: amount > 0 ? Math.min(100, prev.trustScore + 0.5) : prev.trustScore,
    }));
    const entry: CreditTransaction = {
      id: Math.random().toString(36).slice(2),
      userId: currentUser.id,
      amount,
      reason,
      type: amount > 0 ? 'earned' : 'spent',
      timestamp: new Date().toISOString(),
    };
    setCreditHistory((prev) => [entry, ...prev]);
    supabase.from('credit_history').insert({
      user_id: currentUser.id,
      amount,
      reason,
      type: amount > 0 ? 'earned' : 'spent',
    }).then(() => {});
    supabase.from('profiles').update({
      credits: currentUser.credits + amount,
      trust_score: amount > 0 ? Math.min(100, currentUser.trustScore + 0.5) : currentUser.trustScore,
    }).eq('id', currentUser.id).then(() => {});
  }, [currentUser, supabase]);

  const updateCurrentUser = useCallback((updates: Partial<Pick<User, 'name' | 'avatar' | 'pickupLocation' | 'grade' | 'school' | 'studentId'>>) => {
    setCurrentUser((prev) => ({ ...prev, ...updates }));
    supabase.from('profiles').update({
      ...(updates.name ? { name: updates.name } : {}),
      ...(updates.avatar ? { avatar: updates.avatar } : {}),
      ...(updates.pickupLocation ? { pickup_location: updates.pickupLocation } : {}),
      ...(updates.grade ? { grade: String(updates.grade) } : {}),
      ...(updates.school ? { school: updates.school } : {}),
      ...(updates.studentId ? { student_id: updates.studentId } : {}),
    }).eq('id', currentUser.id).then(() => {});
    showToast('Profile updated', 'success');
  }, [currentUser.id, showToast, supabase]);

  // Campus location list
  const locations = useMemo(() => {
    const fromData = [
      ...availability.map((a) => a.location),
      ...items.map((i) => i.pickupLocation),
      currentUser.pickupLocation,
    ].filter((value): value is string => Boolean(value && value.trim()));
    return [...new Set([...LOCATIONS, ...fromData])];
  }, [availability, items, currentUser.pickupLocation]);

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
      locations,
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
      updateCurrentUser,
      isSupabaseReady,
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
