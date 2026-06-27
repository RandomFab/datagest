import { Injectable, signal, computed } from '@angular/core';
import { Entry, Food } from '../models/entry.model';

const MOCK_FOODS: Food[] = [
  { id: '1', name: 'Banana', category: 'Plant', subCategory: 'Fruit', allergens: [] },
  { id: '2', name: 'Banana bread', category: 'Plant', subCategory: 'Cereal', allergens: ['Gluten'] },
  { id: '3', name: 'Oatmeal', category: 'Plant', subCategory: 'Cereal', allergens: ['Gluten'] },
  { id: '4', name: 'Oatmeal with banana', category: 'Plant', subCategory: 'Cereal', allergens: ['Gluten'] },
  { id: '5', name: 'Chicken', category: 'Meat', subCategory: 'Poultry', allergens: [] },
  { id: '6', name: 'Chicken salad', category: 'Meal', subCategory: 'Salad', allergens: [] },
  { id: '7', name: 'Water', category: 'Drink', subCategory: 'Cold', allergens: [] },
  { id: '8', name: 'Black coffee', category: 'Drink', subCategory: 'Hot', allergens: [] },
  { id: '9', name: 'Green tea', category: 'Drink', subCategory: 'Hot', allergens: [] },
  { id: '10', name: 'Orange juice', category: 'Drink', subCategory: 'Cold', allergens: [] },
  { id: '11', name: 'Yogurt', category: 'Dairy', subCategory: 'Fermented', allergens: ['Milk'] },
  { id: '12', name: 'Granola', category: 'Plant', subCategory: 'Cereal', allergens: ['Gluten', 'Nuts'] },
  { id: '13', name: 'Avocado toast', category: 'Meal', subCategory: 'Bread', allergens: ['Gluten'] },
  { id: '14', name: 'Salmon', category: 'Fish', subCategory: 'Fatty fish', allergens: ['Fish'] },
  { id: '15', name: 'Plantain', category: 'Plant', subCategory: 'Fruit', allergens: [] },
];

const MOCK_ENTRIES: Entry[] = [
  { id: '1', type: 'drink', name: 'Water', detail: '300 ml', time: '07:10', date: '2026-06-26' },
  { id: '2', type: 'food', name: 'Oatmeal with banana', detail: 'Cooked · normal portion', time: '07:45', date: '2026-06-26' },
  { id: '3', type: 'drink', name: 'Black coffee', detail: '150 ml', time: '08:30', date: '2026-06-26' },
  { id: '4', type: 'stool', name: 'Bowel movement', detail: 'Type 4 · Smooth soft sausage', time: '09:50', date: '2026-06-26', bristolType: 4, quality: 'ideal' },
  { id: '5', type: 'symptom', name: 'Bloating', detail: 'Intensity 6 / 10 · moderate', time: '11:20', date: '2026-06-26', intensity: 6 },
  { id: '6', type: 'food', name: 'Chicken salad', detail: 'Raw · large portion', time: '13:05', date: '2026-06-26' },

  { id: '7', type: 'food', name: 'Yogurt with granola', detail: 'Raw · small portion', time: '08:00', date: '2026-06-25' },
  { id: '8', type: 'drink', name: 'Green tea', detail: '250 ml', time: '10:30', date: '2026-06-25' },
  { id: '9', type: 'stool', name: 'Bowel movement', detail: 'Type 3 · Sausage with cracks', time: '11:00', date: '2026-06-25', bristolType: 3, quality: 'normal' },
  { id: '10', type: 'food', name: 'Salmon', detail: 'Cooked · normal portion', time: '13:15', date: '2026-06-25' },
  { id: '11', type: 'symptom', name: 'Heartburn', detail: 'Intensity 4 / 10 · mild', time: '14:30', date: '2026-06-25', intensity: 4 },
];

@Injectable({ providedIn: 'root' })
export class TodayService {
  private readonly allEntries = signal<Entry[]>(MOCK_ENTRIES);
  readonly currentDate = signal<Date>(new Date(2026, 5, 26));

  readonly currentDateEntries = computed(() => {
    const dateStr = this.formatDate(this.currentDate());
    return this.allEntries()
      .filter(e => e.date === dateStr)
      .sort((a, b) => a.time.localeCompare(b.time));
  });

  readonly hasNextDay = computed(() => {
    const todayStr = this.formatDate(new Date(2026, 5, 26));
    const currentStr = this.formatDate(this.currentDate());
    return currentStr < todayStr;
  });

  goToPreviousDay(): void {
    const d = new Date(this.currentDate());
    d.setDate(d.getDate() - 1);
    this.currentDate.set(d);
  }

  goToNextDay(): void {
    const d = new Date(this.currentDate());
    d.setDate(d.getDate() + 1);
    this.currentDate.set(d);
  }

  addEntry(entry: Omit<Entry, 'id'>): void {
    const newEntry: Entry = { ...entry, id: Date.now().toString() };
    this.allEntries.update(entries => [...entries, newEntry]);
  }

  deleteEntry(id: string): void {
    this.allEntries.update(entries => entries.filter(e => e.id !== id));
  }

  updateEntry(updated: Entry): void {
    this.allEntries.update(entries => entries.map(e => e.id === updated.id ? updated : e));
  }

  searchFoods(query: string): Food[] {
    if (!query.trim()) return MOCK_FOODS.slice(0, 5);
    const q = query.toLowerCase();
    return MOCK_FOODS.filter(f => f.name.toLowerCase().includes(q)).slice(0, 6);
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  formatDisplayDate(date: Date): string {
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
    });
  }

  isToday(date: Date): boolean {
    return this.formatDate(date) === this.formatDate(new Date(2026, 5, 26));
  }
}
