import { Component, ChangeDetectionStrategy, output, inject, signal, computed, input, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TodayService } from '../../services/today.service';
import { Entry, Food, EntryType } from '../../models/entry.model';

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

  step = signal<Step>('search');
  searchQuery = signal('');
  activeTab = signal<EntryType>('food');
  selectedFood = signal<Food | null>(null);
  preparation = signal<Preparation>('raw');
  quantity = signal<Quantity>('normal');
  entryTime = signal<string>(this.currentTime());

  searchResults = computed(() => this.svc.searchFoods(this.searchQuery()));

  constructor() {
    effect(() => {
      const e = this.existingEntry();
      if (e) {
        this.activeTab.set(e.type as EntryType);
        this.selectedFood.set({ id: e.id, name: e.name, category: '', subCategory: '', allergens: [] });
        this.step.set('details');
        this.entryTime.set(e.time);
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
  }

  selectFood(food: Food): void {
    this.selectedFood.set(food);
    this.step.set('details');
  }

  addNewFood(): void {
    const name = this.searchQuery().trim();
    if (!name) return;
    const fakeFood: Food = { id: 'new', name, category: '', subCategory: '', allergens: [] };
    this.selectedFood.set(fakeFood);
    this.step.set('details');
  }

  confirm(): void {
    const food = this.selectedFood();
    if (!food) return;
    const type = this.activeTab();
    const detail = type === 'food'
      ? `${this.capitalize(this.preparation())} · ${this.quantity()} portion`
      : `${this.searchQuery() || food.name}`;

    const existing = this.existingEntry();
    if (existing) {
      this.svc.updateEntry({ ...existing, name: food.name, detail, type, time: this.entryTime() });
    } else {
      this.svc.addEntry({
        type,
        name: food.name,
        detail,
        time: this.entryTime(),
        date: this.svc.formatDate(this.svc.currentDate()),
      });
    }
    this.closed.emit();
  }

  back(): void {
    this.step.set('search');
    this.selectedFood.set(null);
  }

  private capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  private currentTime(): string {
    return new Date().toTimeString().slice(0, 5);
  }
}
