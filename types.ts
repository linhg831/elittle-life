export type Category = 'WORK' | 'FAMILY' | 'LONG_TERM';

export interface Task {
  id: string;
  recurringId?: string; // Links tasks from the same recurring series
  text: string;
  category: Category;
  date: string | null; // ISO YYYY-MM-DD for Work/Family, null for Long Term
  time: string | null; // HH:mm or null
  completed: boolean;
  createdAt: number;
}

export interface RecurringSettings {
  startDate: string;
  endDate: string;
  daysOfWeek: number[]; // 0 = Sunday, 1 = Monday, etc.
}