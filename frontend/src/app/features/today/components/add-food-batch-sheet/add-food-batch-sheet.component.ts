import {
  Component, ChangeDetectionStrategy, output, inject,
  signal, computed, input, ElementRef, DestroyRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TodayService } from '../../services/today.service';
import { EntryType } from '../../models/entry.model';
import { FoodItemRead, FoodCategory } from '../../../../core/models/food.model';
import { AddFoodItemSheetComponent } from '../../../../shared/components/add-food-item-sheet/add-food-item-sheet.component';

type Preparation = 'raw' | 'cooked';
type Quantity = 'small' | 'normal' | 'large';

interface Draft {
  food: FoodItemRead;
  preparation: Preparation;
  quantity: Quantity;
  volumeMl?: number;
}

@Component({
  selector: 'app-add-food-batch-sheet',
  imports: [FormsModule, AddFoodItemSheetComponent],
  templateUrl: './add-food-batch-sheet.component.html',
  styleUrl: './add-food-batch-sheet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddFoodBatchSheetComponent {
  entryType = input<EntryType>('food');
  closed = output<void>();

  private readonly svc = inject(TodayService);
  private readonly search$ = new Subject<string>();
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  readonly activeTab = computed(() => this.entryType() as 'food' | 'drink');
  readonly defaultCategory = computed<FoodCategory>(() => this.activeTab() === 'drink' ? 'Drink' : 'Plant');

  searchQuery = signal('');
  searchResults = signal<FoodItemRead[]>([]);
  searching = signal(false);

  drafts = signal<Draft[]>([]);
  expandedIds = signal<Set<number>>(new Set());
  entryTime = signal<string>(this.currentTime());

  showCreateSheet = signal(false);
  submitting = signal(false);
  error = signal<string | null>(null);

  readonly selectedIds = computed(() => new Set(this.drafts().map(d => d.food.id)));

  constructor() {
    this.search$.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(q => {
        this.searching.set(true);
        return this.svc.searchFoods(q, this.activeTab());
      }),
      takeUntilDestroyed(),
    ).subscribe({
      next: (results) => {
        this.searchResults.set(results);
        this.searching.set(false);
      },
      error: () => this.searching.set(false),
    });

    this.search$.next('');
    this.trackKeyboardOffset();
  }

  onQueryChange(value: string): void {
    this.searchQuery.set(value);
    this.search$.next(value);
  }

  isSelected(foodId: number): boolean {
    return this.selectedIds().has(foodId);
  }

  toggleResult(food: FoodItemRead): void {
    if (this.isSelected(food.id)) {
      this.removeDraft(food.id);
      return;
    }
    this.drafts.update(list => [...list, { food, preparation: 'raw', quantity: 'normal' }]);
  }

  removeDraft(foodId: number): void {
    this.drafts.update(list => list.filter(d => d.food.id !== foodId));
    this.expandedIds.update(set => {
      const next = new Set(set);
      next.delete(foodId);
      return next;
    });
  }

  isExpanded(foodId: number): boolean {
    return this.expandedIds().has(foodId);
  }

  toggleExpanded(foodId: number): void {
    this.expandedIds.update(set => {
      const next = new Set(set);
      next.has(foodId) ? next.delete(foodId) : next.add(foodId);
      return next;
    });
  }

  setPreparation(foodId: number, value: Preparation): void {
    this.drafts.update(list => list.map(d => d.food.id === foodId ? { ...d, preparation: value } : d));
  }

  setQuantity(foodId: number, value: Quantity): void {
    this.drafts.update(list => list.map(d => d.food.id === foodId ? { ...d, quantity: value } : d));
  }

  setVolume(foodId: number, value: number | undefined): void {
    this.drafts.update(list => list.map(d => d.food.id === foodId ? { ...d, volumeMl: value } : d));
  }

  openCreateSheet(): void {
    this.showCreateSheet.set(true);
  }

  onFoodCreated(item: FoodItemRead): void {
    this.showCreateSheet.set(false);
    this.drafts.update(list => [...list, { food: item, preparation: 'raw', quantity: 'normal' }]);
    this.expandedIds.update(set => new Set(set).add(item.id));
  }

  submit(): void {
    const items = this.drafts();
    if (items.length === 0 || this.submitting()) return;
    this.submitting.set(true);
    this.error.set(null);

    this.svc.addFoodEntriesBatch({
      entryType: this.activeTab(),
      time: this.entryTime(),
      items: items.map(d => ({
        foodItemId: d.food.id,
        preparation: this.activeTab() === 'food' ? d.preparation : undefined,
        quantity: this.activeTab() === 'food' ? d.quantity : undefined,
        volumeMl: this.activeTab() === 'drink' ? d.volumeMl : undefined,
      })),
    }).subscribe({
      next: () => this.closed.emit(),
      error: () => {
        this.error.set('Failed to save. Please try again.');
        this.submitting.set(false);
      },
    });
  }

  private currentTime(): string {
    return new Date().toTimeString().slice(0, 5);
  }

  /** Keeps the sheet above the on-screen keyboard: mobile browsers shrink the
   * visual viewport but not the layout viewport, so a `bottom: 0` sheet ends up
   * hidden behind the keyboard unless we offset it manually. */
  private trackKeyboardOffset(): void {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const updateOffset = () => {
      const offset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      this.elementRef.nativeElement.style.setProperty('--keyboard-offset', `${offset}px`);
    };

    viewport.addEventListener('resize', updateOffset);
    viewport.addEventListener('scroll', updateOffset);
    updateOffset();

    this.destroyRef.onDestroy(() => {
      viewport.removeEventListener('resize', updateOffset);
      viewport.removeEventListener('scroll', updateOffset);
    });
  }
}
