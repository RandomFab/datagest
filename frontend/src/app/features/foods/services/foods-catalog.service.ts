import { Injectable, inject, signal } from '@angular/core';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest, switchMap, debounceTime, distinctUntilChanged, catchError, EMPTY } from 'rxjs';
import { FoodApiService } from '../../../core/services/food-api.service';
import { FoodItemRead } from '../../../core/models/food.model';

@Injectable()
export class FoodsCatalogService {
  private readonly api = inject(FoodApiService);

  readonly activeTab = signal<'food' | 'drink'>('food');
  readonly searchQuery = signal('');
  readonly items = signal<FoodItemRead[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    combineLatest([
      toObservable(this.activeTab),
      toObservable(this.searchQuery).pipe(debounceTime(250), distinctUntilChanged()),
    ]).pipe(
      switchMap(([tab, q]) => {
        this.loading.set(true);
        this.error.set(null);
        return this.api.list({ is_drink: tab === 'drink', search: q || undefined }).pipe(
          catchError(() => {
            this.error.set('Failed to load items');
            this.loading.set(false);
            return EMPTY;
          }),
        );
      }),
      takeUntilDestroyed(),
    ).subscribe(items => {
      this.items.set(items);
      this.loading.set(false);
    });
  }

  prepend(item: FoodItemRead): void {
    this.items.update(list => [item, ...list]);
  }

  replace(updated: FoodItemRead): void {
    this.items.update(list => list.map(i => i.id === updated.id ? updated : i));
  }

  remove(id: number): void {
    this.items.update(list => list.filter(i => i.id !== id));
  }
}
