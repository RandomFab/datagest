import {
  Component, ChangeDetectionStrategy, output, inject,
  signal, computed, input, effect, ElementRef, DestroyRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TodayService } from '../../services/today.service';
import { Entry, EntryType } from '../../models/entry.model';
import { FoodItemRead } from '../../../../core/models/food.model';

type Step = 'search' | 'details';
type Preparation = 'raw' | 'cooked';
type Quantity = 'small' | 'normal' | 'large';

@Component({
  selector: 'app-add-food-sheet',
  imports: [FormsModule],
  templateUrl: './add-food-sheet.component.html',
  styleUrl: './add-food-sheet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddFoodSheetComponent {
  entryType = input<EntryType>('food');
  existingEntry = input<Entry | null>(null);
  closed = output<void>();

  private readonly svc = inject(TodayService);
  private readonly search$ = new Subject<string>();
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  step = signal<Step>('search');
  searchQuery = signal('');
  readonly activeTab = computed(() => this.entryType());
  selectedFood = signal<FoodItemRead | null>(null);
  customFoodName = signal<string | null>(null);
  preparation = signal<Preparation>('raw');
  quantity = signal<Quantity>('normal');
  volumeMl = signal<number | undefined>(undefined);
  entryTime = signal<string>(this.currentTime());
  searchResults = signal<FoodItemRead[]>([]);
  searching = signal(false);

  readonly displayName = computed(() => this.selectedFood()?.name ?? this.customFoodName() ?? '');

  constructor() {
    this.search$.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(q => {
        this.searching.set(true);
        return this.svc.searchFoods(q, this.entryType() as 'food' | 'drink');
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

    effect(() => {
      const e = this.existingEntry();
      if (e) {
        this.step.set('details');
        this.entryTime.set(e.time);
        this.customFoodName.set(e.name);
        if (e.type === 'food') {
          const lower = (e.detail ?? '').toLowerCase();
          this.preparation.set(lower.includes('cooked') ? 'cooked' : 'raw');
          this.quantity.set(lower.includes('large') ? 'large' : lower.includes('small') ? 'small' : 'normal');
        }
      }
    });
  }

  get isEditing(): boolean {
    return this.existingEntry() !== null;
  }

  onQueryChange(value: string): void {
    this.searchQuery.set(value);
    this.search$.next(value);
  }

  selectFood(food: FoodItemRead): void {
    this.selectedFood.set(food);
    this.customFoodName.set(null);
    this.step.set('details');
  }

  addNewFood(): void {
    const name = this.searchQuery().trim();
    if (!name) return;
    this.selectedFood.set(null);
    this.customFoodName.set(name);
    this.step.set('details');
  }

  confirm(): void {
    const name = this.displayName();
    if (!name) return;
    const type = this.activeTab() as 'food' | 'drink';
    const existing = this.existingEntry();

    if (existing) {
      this.svc.updateFoodEntry(existing, {
        preparation: type === 'food' ? this.preparation() : undefined,
        quantity: type === 'food' ? this.quantity() : undefined,
        time: this.entryTime(),
      }).subscribe({ next: () => this.closed.emit(), error: (e) => console.error(e) });
    } else {
      this.svc.addFoodEntry({
        foodItemId: this.selectedFood()?.id,
        customName: this.customFoodName() ?? undefined,
        entryType: type,
        preparation: type === 'food' ? this.preparation() : undefined,
        quantity: type === 'food' ? this.quantity() : undefined,
        volumeMl: type === 'drink' ? this.volumeMl() : undefined,
        time: this.entryTime(),
      }).subscribe({ next: () => this.closed.emit(), error: (e) => console.error(e) });
    }
  }

  back(): void {
    this.step.set('search');
    this.selectedFood.set(null);
    this.customFoodName.set(null);
    this.search$.next(this.searchQuery());
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
