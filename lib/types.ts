export type ItemCategory =
  | 'calculator'
  | 'charger'
  | 'science'
  | 'school-supply'
  | 'robotics'
  | 'media'
  | 'sports'
  | 'tech'
  | 'art'
  | 'other';

export type ItemCondition = 'excellent' | 'good' | 'fair';
export type UrgencyLevel = 'low' | 'normal' | 'urgent';
export type AvailabilityType = 'lunch' | 'free-period' | 'after-school' | 'before-school';
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';

export const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Master location list
export const LOCATIONS = [
  'Library',
  'Cafeteria',
  'Room 210',
  'STEM Lab',
  'Gym',
  'Hallway',
  'Main Office',
  'Front Entrance',
  'Science Room',
  'Math Room',
];
export const AVAILABILITY_TYPES: AvailabilityType[] = ['before-school', 'free-period', 'lunch', 'after-school'];

export interface User {
  id: string;
  name: string;
  grade: number;
  trustScore: number;
  credits: number;
  pickupLocation: string;
  school?: string;
  studentId?: string;
  avatar: string;
  itemsLent: number;
  itemsBorrowed: number;
  onTimeReturns: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
}

export interface AvailabilityBlock {
  id: string;
  userId: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  location: string;
  type: AvailabilityType;
}

export interface Item {
  id: string;
  name: string;
  category: ItemCategory;
  description: string;
  condition: ItemCondition;
  ownerId: string;
  ownerName: string;
  ownerTrustScore: number;
  pickupLocation: string;
  availableDays: DayOfWeek[];
  availableStart: string;
  availableEnd: string;
  availabilityLabel: string;
  isExpensive: boolean;
  rules?: string;
  isAvailable: boolean;
  listedAt: string;
}

export interface BorrowRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  itemCategory: ItemCategory;
  itemName: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  period: string;
  urgency: UrgencyLevel;
  preferredLocation: string;
  notes?: string;
  status: 'pending' | 'matched' | 'approved' | 'checked-out' | 'returned' | 'cancelled';
  createdAt: string;
  matchedItemId?: string;
  matchedUserId?: string;
}

export interface MatchResult {
  item: Item;
  lender: User;
  score: number;
  reasons: string[];
  overlapStart: string;
  overlapEnd: string;
  estimatedHandoff: string;
}

export interface Transaction {
  id: string;
  itemId: string;
  itemName: string;
  borrowerId: string;
  borrowerName: string;
  lenderId: string;
  lenderName: string;
  checkoutTime: string;
  dueTime: string;
  returnTime?: string;
  status: 'active' | 'returned' | 'overdue';
  pickupLocation: string;
  creditsAwarded?: number;
}

export interface LostItem {
  id: string;
  reporterId: string;
  reporterName: string;
  itemName: string;
  category: ItemCategory;
  description: string;
  lastSeenLocation: string;
  timeLost: string;
  uniqueDetail: string;
  status: 'active' | 'recovered';
  reportedAt: string;
}

export interface FoundItem {
  id: string;
  reporterId: string;
  reporterName: string;
  itemName: string;
  category: ItemCategory;
  description: string;
  locationFound: string;
  timeFound: string;
  verificationDetail: string;
  status: 'unclaimed' | 'claimed';
  reportedAt: string;
}

export interface LostFoundMatch {
  lostItem: LostItem;
  foundItem: FoundItem;
  confidence: number;
  reasons: string[];
}

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  type: 'earned' | 'spent';
  timestamp: string;
}

export interface RedemptionOption {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: string;
}
