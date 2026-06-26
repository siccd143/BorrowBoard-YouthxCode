import {
  Calculator,
  Camera,
  Dumbbell,
  FlaskConical,
  Monitor,
  Package,
  Paintbrush,
  Plug,
  Wrench,
} from 'lucide-react';
import type React from 'react';
import { ItemCategory } from '@/lib/types';

export const CATEGORY_OPTIONS: Array<{ value: ItemCategory; label: string }> = [
  { value: 'calculator', label: 'Calculator' },
  { value: 'charger', label: 'Charger' },
  { value: 'science', label: 'Science Equipment' },
  { value: 'school-supply', label: 'School Supply' },
  { value: 'robotics', label: 'Robotics / Tools' },
  { value: 'media', label: 'Media / Photography' },
  { value: 'sports', label: 'Sports' },
  { value: 'tech', label: 'Tech Accessories' },
  { value: 'art', label: 'Art Supplies' },
  { value: 'other', label: 'Other' },
];

export const CATEGORY_FILTER_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  ...CATEGORY_OPTIONS,
];

export const categoryConfig: Record<ItemCategory, { icon: React.ElementType; bg: string; text: string; label: string }> = {
  calculator: { icon: Calculator, bg: 'bg-blue-50', text: 'text-blue-600', label: 'Calculator' },
  charger: { icon: Plug, bg: 'bg-amber-50', text: 'text-amber-600', label: 'Charger' },
  science: { icon: FlaskConical, bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'Science Equipment' },
  'school-supply': { icon: Package, bg: 'bg-orange-50', text: 'text-orange-600', label: 'School Supply' },
  robotics: { icon: Wrench, bg: 'bg-violet-50', text: 'text-violet-600', label: 'Robotics / Tools' },
  media: { icon: Camera, bg: 'bg-pink-50', text: 'text-pink-600', label: 'Media / Photography' },
  sports: { icon: Dumbbell, bg: 'bg-red-50', text: 'text-red-500', label: 'Sports' },
  tech: { icon: Monitor, bg: 'bg-indigo-50', text: 'text-indigo-600', label: 'Tech Accessories' },
  art: { icon: Paintbrush, bg: 'bg-rose-50', text: 'text-rose-500', label: 'Art Supplies' },
  other: { icon: Package, bg: 'bg-gray-50', text: 'text-gray-500', label: 'Other' },
};

const classifierKeywords: Array<{ category: ItemCategory; keywords: string[] }> = [
  { category: 'calculator', keywords: ['calculator', 'ti-84', 'ti84', 'graphing'] },
  { category: 'charger', keywords: ['charger', 'usb', 'usb-c', 'lightning', 'adapter', 'cable'] },
  { category: 'science', keywords: ['goggles', 'lab', 'beaker', 'microscope', 'science'] },
  { category: 'school-supply', keywords: ['ruler', 'pencil', 'pen', 'notebook', 'book', 'binder', 'folder', 'marker', 'eraser', 'sharpener', 'scissors'] },
  { category: 'robotics', keywords: ['tool', 'toolkit', 'wrench', 'screwdriver', 'robot', 'robotics'] },
  { category: 'media', keywords: ['camera', 'tripod', 'microphone', 'mic', 'lens'] },
  { category: 'sports', keywords: ['ball', 'cleats', 'racket', 'bat', 'glove', 'skateboard', 'frisbee', 'sports', 'jersey'] },
  { category: 'tech', keywords: ['laptop', 'mouse', 'keyboard', 'headphones', 'earbuds', 'tablet', 'phone', 'monitor'] },
  { category: 'art', keywords: ['paint', 'brush', 'canvas', 'sketch', 'colored pencil'] },
];

export function inferItemCategory(value: string): ItemCategory {
  const lower = value.toLowerCase();
  return classifierKeywords.find((entry) => entry.keywords.some((keyword) => lower.includes(keyword)))?.category ?? 'other';
}
