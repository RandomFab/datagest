import { Injectable, signal, computed, inject } from '@angular/core';
import { forkJoin, Observable, tap } from 'rxjs';
import { Entry, Food } from '../models/entry.model';
import { FoodApiService } from '../../../core/services/food-api.service';
import { LogApiService } from '../../../core/services/log-api.service';
import { FoodLogCreate, FoodLogUpdate, StoolLogCreate, StoolLogUpdate, SymptomLogCreate, SymptomLogUpdate, StoolQuality } from '../../../core/models/log.model';
import { FoodItemRead } from '../../../core/models/food.model';
import { BRISTOL_TYPES } from '../models/entry.model';

@Injectable({ providedIn: 'root' })
export class TodayService {
  private readonly foodApi = inject(FoodApiService);
  private readonly logApi = inject(LogApiService);

  readonly currentDate = signal<Date>(new Date());
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  private readonly allEntries = signal<Entry[]>([]);

  readonly currentDateEntries = computed(() =>
    this.allEntries().sort((a, b) => a.time.localeCompare(b.time))
  );

  readonly hasNextDay = computed(() => {
    const todayStr = this.formatDate(new Date());
    const currentStr = this.formatDate(this.currentDate());
    return currentStr < todayStr;
  });

  constructor() {
    this.loadDay(this.currentDate());
  }

  loadDay(date: Date): void {
    const dateStr = this.formatDate(date);
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      food: this.logApi.listFoodLogs(dateStr),
      stools: this.logApi.listStoolLogs(dateStr),
      symptoms: this.logApi.listSymptomLogs(dateStr),
    }).subscribe({
      next: ({ food, stools, symptoms }) => {
        const entries: Entry[] = [
          ...food.map(f => this.foodLogToEntry(f)),
          ...stools.map(s => this.stoolLogToEntry(s)),
          ...symptoms.map(s => this.symptomLogToEntry(s)),
        ];
        this.allEntries.set(entries);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load day logs', err);
        this.error.set('Impossible de charger les données. Vérifie que l\'API est démarrée.');
        this.loading.set(false);
      },
    });
  }

  goToPreviousDay(): void {
    const d = new Date(this.currentDate());
    d.setDate(d.getDate() - 1);
    this.currentDate.set(d);
    this.loadDay(d);
  }

  goToNextDay(): void {
    if (!this.hasNextDay()) return;
    const d = new Date(this.currentDate());
    d.setDate(d.getDate() + 1);
    this.currentDate.set(d);
    this.loadDay(d);
  }

  addFoodEntry(params: {
    foodItemId?: number;
    customName?: string;
    entryType: 'food' | 'drink';
    preparation?: 'raw' | 'cooked';
    quantity?: 'small' | 'normal' | 'large';
    volumeMl?: number;
    time: string;
    notes?: string;
  }): Observable<Entry> {
    const loggedAt = this.buildLoggedAt(params.time);
    const payload: FoodLogCreate = {
      food_item_id: params.foodItemId,
      custom_name: params.customName,
      entry_type: params.entryType,
      preparation: params.preparation,
      quantity: params.quantity,
      volume_ml: params.volumeMl,
      logged_at: loggedAt,
      notes: params.notes,
    };
    return new Observable(observer => {
      this.logApi.createFoodLog(payload).subscribe({
        next: (log) => {
          const entry = this.foodLogToEntry(log);
          this.allEntries.update(entries => [...entries, entry]);
          observer.next(entry);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  addStoolEntry(bristolType: number, quality: StoolQuality, time: string, notes?: string): Observable<Entry> {
    const payload: StoolLogCreate = {
      bristol_type: bristolType,
      quality,
      logged_at: this.buildLoggedAt(time),
      notes,
    };
    return new Observable(observer => {
      this.logApi.createStoolLog(payload).subscribe({
        next: (log) => {
          const entry = this.stoolLogToEntry(log);
          this.allEntries.update(entries => [...entries, entry]);
          observer.next(entry);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  addSymptomEntry(name: string, intensity: number, time: string, notes?: string): Observable<Entry> {
    const payload: SymptomLogCreate = {
      name,
      intensity,
      logged_at: this.buildLoggedAt(time),
      notes,
    };
    return new Observable(observer => {
      this.logApi.createSymptomLog(payload).subscribe({
        next: (log) => {
          const entry = this.symptomLogToEntry(log);
          this.allEntries.update(entries => [...entries, entry]);
          observer.next(entry);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  updateFoodEntry(entry: Entry, params: {
    preparation?: 'raw' | 'cooked';
    quantity?: 'small' | 'normal' | 'large';
    volumeMl?: number;
    time: string;
    notes?: string;
  }): Observable<Entry> {
    const id = this.entryNumericId(entry);
    const payload: FoodLogUpdate = {
      preparation: params.preparation,
      quantity: params.quantity,
      volume_ml: params.volumeMl,
      logged_at: this.buildLoggedAt(params.time),
      notes: params.notes,
    };
    return new Observable(observer => {
      this.logApi.updateFoodLog(id, payload).subscribe({
        next: (log) => {
          const updated = this.foodLogToEntry(log);
          this.allEntries.update(entries => entries.map(e => e.id === entry.id ? updated : e));
          observer.next(updated);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  updateStoolEntry(entry: Entry, bristolType: number, quality: StoolQuality, time: string): Observable<Entry> {
    const id = this.entryNumericId(entry);
    const payload: StoolLogUpdate = {
      bristol_type: bristolType,
      quality,
      logged_at: this.buildLoggedAt(time),
    };
    return new Observable(observer => {
      this.logApi.updateStoolLog(id, payload).subscribe({
        next: (log) => {
          const updated = this.stoolLogToEntry(log);
          this.allEntries.update(entries => entries.map(e => e.id === entry.id ? updated : e));
          observer.next(updated);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  updateSymptomEntry(entry: Entry, name: string, intensity: number, time: string): Observable<Entry> {
    const id = this.entryNumericId(entry);
    const payload: SymptomLogUpdate = { name, intensity, logged_at: this.buildLoggedAt(time) };
    return new Observable(observer => {
      this.logApi.updateSymptomLog(id, payload).subscribe({
        next: (log) => {
          const updated = this.symptomLogToEntry(log);
          this.allEntries.update(entries => entries.map(e => e.id === entry.id ? updated : e));
          observer.next(updated);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  deleteEntry(id: string): void {
    const [type, numId] = id.split(':');
    const nId = Number(numId);
    const delete$ = type === 'food' || type === 'drink'
      ? this.logApi.deleteFoodLog(nId)
      : type === 'stool'
        ? this.logApi.deleteStoolLog(nId)
        : this.logApi.deleteSymptomLog(nId);

    delete$.subscribe({
      next: () => this.allEntries.update(entries => entries.filter(e => e.id !== id)),
      error: (err) => console.error('Delete failed', err),
    });
  }

  searchFoods(query: string, type: 'food' | 'drink'): Observable<FoodItemRead[]> {
    return this.foodApi.list({ search: query || undefined, is_drink: type === 'drink' });
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
    return this.formatDate(date) === this.formatDate(new Date());
  }

  // --- Mapping helpers ---

  private foodLogToEntry(log: import('../../../core/models/log.model').FoodLogRead): Entry {
    const name = log.food_item?.name ?? log.custom_name ?? 'Aliment inconnu';
    const type = log.entry_type;
    let detail: string;
    if (type === 'drink') {
      detail = log.volume_ml ? `${log.volume_ml} ml` : '';
    } else {
      const parts: string[] = [];
      if (log.preparation) parts.push(this.capitalize(log.preparation));
      if (log.quantity) parts.push(`${log.quantity} portion`);
      detail = parts.join(' · ');
    }
    return {
      id: `${type}:${log.id}`,
      type,
      name,
      detail,
      time: log.logged_at.slice(11, 16),
      date: log.logged_at.slice(0, 10),
    };
  }

  private stoolLogToEntry(log: import('../../../core/models/log.model').StoolLogRead): Entry {
    const bristol = BRISTOL_TYPES.find(b => b.type === log.bristol_type);
    return {
      id: `stool:${log.id}`,
      type: 'stool',
      name: 'Bowel movement',
      detail: `Type ${log.bristol_type} · ${bristol?.label.split(' · ')[1] ?? ''}`,
      time: log.logged_at.slice(11, 16),
      date: log.logged_at.slice(0, 10),
      bristolType: log.bristol_type,
      quality: log.quality,
    };
  }

  private symptomLogToEntry(log: import('../../../core/models/log.model').SymptomLogRead): Entry {
    const label = log.intensity <= 3 ? 'mild' : log.intensity <= 6 ? 'moderate' : 'severe';
    return {
      id: `symptom:${log.id}`,
      type: 'symptom',
      name: log.name,
      detail: `Intensity ${log.intensity} / 10 · ${label}`,
      time: log.logged_at.slice(11, 16),
      date: log.logged_at.slice(0, 10),
      intensity: log.intensity,
    };
  }

  private buildLoggedAt(time: string): string {
    const dateStr = this.formatDate(this.currentDate());
    return `${dateStr}T${time}:00`;
  }

  private entryNumericId(entry: Entry): number {
    return Number(entry.id.split(':')[1]);
  }

  private capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
}
