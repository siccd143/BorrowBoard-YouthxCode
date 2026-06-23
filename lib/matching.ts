import { AvailabilityBlock, Item, BorrowRequest, MatchResult, User } from './types';
import { MOCK_USERS, MOCK_AVAILABILITY } from './mockData';

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function hasScheduleOverlap(
  lenderStart: string,
  lenderEnd: string,
  requestStart: string,
  requestEnd: string
): { overlaps: boolean; overlapStart: string; overlapEnd: string } {
  const ls = timeToMinutes(lenderStart);
  const le = timeToMinutes(lenderEnd);
  const rs = timeToMinutes(requestStart);
  const re = timeToMinutes(requestEnd);

  const overlaps = ls < re && le > rs;
  const overlapStartMin = Math.max(ls, rs);
  const overlapEndMin = Math.min(le, re);

  const toTime = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  return {
    overlaps,
    overlapStart: toTime(overlapStartMin),
    overlapEnd: toTime(overlaps ? overlapEndMin : overlapStartMin),
  };
}

export function computeMatchScore(
  item: Item,
  lender: User,
  request: BorrowRequest,
  availability: AvailabilityBlock[] = MOCK_AVAILABILITY
): { score: number; reasons: string[]; overlapStart: string; overlapEnd: string } {
  let score = 0;
  const reasons: string[] = [];

  // Category match: 40 points
  if (item.category === request.itemCategory) {
    score += 40;
    reasons.push('Same item category');
  } else if (
    item.name.toLowerCase().includes(request.itemName.toLowerCase()) ||
    request.itemName.toLowerCase().includes(item.name.toLowerCase().split(' ')[0])
  ) {
    score += 20;
    reasons.push('Similar item name');
  }

  // Schedule overlap: 25 points
  const lenderAvailability = availability.filter(
    (a) => a.userId === lender.id && a.day === request.day
  );

  let overlapStart = request.startTime;
  let overlapEnd = request.endTime;
  let hasOverlap = false;

  for (const slot of lenderAvailability) {
    const result = hasScheduleOverlap(slot.startTime, slot.endTime, request.startTime, request.endTime);
    if (result.overlaps) {
      score += 25;
      reasons.push('Available during your needed window');
      overlapStart = result.overlapStart;
      overlapEnd = result.overlapEnd;
      hasOverlap = true;
      break;
    }
  }

  if (!hasOverlap && item.availableDays.includes(request.day)) {
    const itemOverlap = hasScheduleOverlap(item.availableStart, item.availableEnd, request.startTime, request.endTime);
    if (itemOverlap.overlaps) {
      score += 20;
      reasons.push('Item available during your window');
      overlapStart = itemOverlap.overlapStart;
      overlapEnd = itemOverlap.overlapEnd;
    }
  }

  // Trust score: up to 20 points
  const trustBonus = Math.round((lender.trustScore / 100) * 20);
  score += trustBonus;
  if (lender.trustScore >= 90) {
    reasons.push('High lender trust score');
  } else if (lender.trustScore >= 80) {
    reasons.push('Good lender trust score');
  }

  // Location match: 10 points
  if (item.pickupLocation === request.preferredLocation || lender.pickupLocation === request.preferredLocation) {
    score += 10;
    reasons.push(`Both students are near the ${request.preferredLocation}`);
  }

  // Urgency bonus: 5 points
  if (request.urgency === 'urgent') {
    score += 5;
    reasons.push('Helping with urgent request');
  }

  return { score: Math.min(score, 100), reasons, overlapStart, overlapEnd };
}

export function findMatches(
  request: BorrowRequest,
  items: Item[],
  users: User[] = MOCK_USERS,
  availability: AvailabilityBlock[] = MOCK_AVAILABILITY
): MatchResult[] {
  const results: MatchResult[] = [];

  for (const item of items) {
    if (!item.isAvailable) continue;
    if (item.ownerId === request.requesterId) continue;

    const lender = users.find((u) => u.id === item.ownerId);
    if (!lender) continue;

    const { score, reasons, overlapStart, overlapEnd } = computeMatchScore(item, lender, request, availability);

    if (score > 0) {
      const overlapStartMins = timeToMinutes(overlapStart);
      const midMins = overlapStartMins + 5;
      const h = Math.floor(midMins / 60);
      const m = midMins % 60;
      const estimatedHandoff = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

      results.push({ item, lender, score, reasons, overlapStart, overlapEnd, estimatedHandoff });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}
