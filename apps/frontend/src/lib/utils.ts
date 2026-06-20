import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateRelative(date: string | Date): string {
  if (!date) return '';
  const now = new Date();
  const d = new Date(date);
  const diff = d.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} overdue`;
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days <= 7) return `${days} day${days === 1 ? '' : 's'} left`;
  return formatDate(date);
}

export function isOverdue(date: string | Date): boolean {
  if (!date) return false;
  return new Date(date) < new Date() && !isToday(date);
}

export function isToday(date: string | Date): boolean {
  if (!date) return false;
  const d = new Date(date);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

export function getInitials(name: string): string {
  if (!name) return '';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getOverdueDays(dueDate: string | Date, completedAt?: string | Date | null): number {
  if (!dueDate) return 0;
  const due = new Date(dueDate);
  const end = completedAt ? new Date(completedAt) : new Date();
  const diff = end.getTime() - due.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function getDelayText(dueDate: string | Date, completedAt?: string | Date | null): string {
  const days = getOverdueDays(dueDate, completedAt);
  if (days === 0) return '';
  if (completedAt) return `Completed ${days} day${days === 1 ? '' : 's'} late`;
  return `Overdue by ${days} day${days === 1 ? '' : 's'}`;
}

export function getPosterSrcAndPosition(posterImage: string | null | undefined): { src: string; position: string } {
  if (!posterImage) return { src: '/default-event-poster.png', position: '50% 50%' };
  const hashIndex = posterImage.lastIndexOf('#pos=');
  if (hashIndex !== -1) {
    const src = posterImage.substring(0, hashIndex);
    const pos = posterImage.substring(hashIndex + 5);
    return { src, position: `50% ${pos}%` };
  }
  return { src: posterImage, position: '50% 50%' };
}
