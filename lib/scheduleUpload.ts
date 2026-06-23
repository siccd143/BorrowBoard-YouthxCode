import { AvailabilityBlock, AvailabilityType, DayOfWeek } from '@/lib/types';

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const LOCATIONS = ['Library', 'Cafeteria', 'Room 210', 'STEM Lab', 'Gym', 'Main Office', 'Front Entrance', 'Hallway'];

const typeKeywords: Array<{ type: AvailabilityType; keywords: string[] }> = [
  { type: 'lunch', keywords: ['lunch'] },
  { type: 'before-school', keywords: ['before school', 'morning', 'arrival'] },
  { type: 'after-school', keywords: ['after school', 'dismissal', 'club'] },
  { type: 'passing-period', keywords: ['passing', 'between classes', 'hallway'] },
  { type: 'free-period', keywords: ['free', 'study hall', 'open', 'flex'] },
];

function normalizeTime(value: string) {
  const match = value.trim().toLowerCase().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);

  if (!match) return value.trim();

  let hour = Number(match[1]);
  const minute = match[2] ?? '00';
  const meridiem = match[3];

  if (meridiem === 'pm' && hour < 12) hour += 12;
  if (meridiem === 'am' && hour === 12) hour = 0;

  return `${String(hour).padStart(2, '0')}:${minute}`;
}

function findDay(line: string) {
  return DAYS.find((day) => new RegExp(`\\b${day}\\b`, 'i').test(line));
}

function findLocation(line: string, fallback: string) {
  return LOCATIONS.find((location) => line.toLowerCase().includes(location.toLowerCase())) ?? fallback;
}

function findType(line: string): AvailabilityType {
  const lower = line.toLowerCase();
  return typeKeywords.find((entry) => entry.keywords.some((keyword) => lower.includes(keyword)))?.type ?? 'free-period';
}

export function parseScheduleText(text: string, userId: string, fallbackLocation: string) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.reduce<AvailabilityBlock[]>((blocks, line, index) => {
    const day = findDay(line);
    const timeMatch = line.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*(?:-|to|–|—)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);

    if (!day || !timeMatch) return blocks;

    blocks.push({
      id: `upload-${Date.now()}-${index}`,
      userId,
      day,
      startTime: normalizeTime(timeMatch[1]),
      endTime: normalizeTime(timeMatch[2]),
      location: findLocation(line, fallbackLocation),
      type: findType(line),
    });

    return blocks;
  }, []);
}
