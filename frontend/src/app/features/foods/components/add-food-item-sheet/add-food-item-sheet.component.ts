import { Component, ChangeDetectionStrategy, output, inject, signal, computed, input, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AllergenApiService } from '../../../../core/services/allergen-api.service';
import { FoodApiService } from '../../../../core/services/food-api.service';
import { AllergenRead, FoodCategory, FoodItemRead } from '../../../../core/models/food.model';
import { FoodsCatalogService } from '../../services/foods-catalog.service';

const CATEGORIES: FoodCategory[] = ['Plant', 'Meat', 'Dairy', 'Fish', 'Drink', 'Meal'];

@Component({
  selector: 'app-add-food-item-sheet',
  imports: [FormsModule],
  templateUrl: './add-food-item-sheet.component.html',
  styleUrl: './add-food-item-sheet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddFoodItemSheetComponent {
  existingItem = input<FoodItemRead | null>(null);
  closed = output<void>();

  private readonly allergenApi = inject(AllergenApiService);
  private readonly foodApi = inject(FoodApiService);
  private readonly catalog = inject(FoodsCatalogService);

  readonly categories = CATEGORIES;

  name = signal('');
  subCategory = signal('');
  category = signal<FoodCategory>('Plant');
  selectedAllergenIds = signal<Set<number>>(new Set());
  allergens = signal<AllergenRead[]>([]);
  submitting = signal(false);
  error = signal<string | null>(null);

  readonly isEditing = computed(() => this.existingItem() !== null);
  readonly isDrink = computed(() => this.category() === 'Drink');
  readonly canSubmit = computed(() => this.name().trim().length > 0 && !this.submitting());

  constructor() {
    this.category.set(this.catalog.activeTab() === 'drink' ? 'Drink' : 'Plant');

    this.allergenApi.list().subscribe(allergens => {
      this.allergens.set(allergens);
      const existing = this.existingItem();
      if (existing) {
        this.selectedAllergenIds.set(new Set(existing.allergens.map(a => a.id)));
      }
    });

    effect(() => {
      const existing = this.existingItem();
      if (existing) {
        this.name.set(existing.name);
        this.category.set(existing.category);
        this.subCategory.set(existing.sub_category ?? '');
        if (this.allergens().length > 0) {
          this.selectedAllergenIds.set(new Set(existing.allergens.map(a => a.id)));
        }
      }
    });
  }

  toggleAllergen(id: number): void {
    this.selectedAllergenIds.update(set => {
      const next = new Set(set);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  submit(): void {
    if (!this.canSubmit()) return;
    this.submitting.set(true);
    this.error.set(null);

    const existing = this.existingItem();
    const payload = {
      name: this.name().trim(),
      category: this.category(),
      sub_category: this.subCategory().trim() || undefined,
      is_drink: this.isDrink(),
      allergen_ids: [...this.selectedAllergenIds()],
    };

    if (existing) {
      this.foodApi.update(existing.id, payload).subscribe({
        next: updated => {
          this.catalog.replace(updated);
          this.closed.emit();
        },
        error: () => {
          this.error.set('Failed to save. Please try again.');
          this.submitting.set(false);
        },
      });
    } else {
      this.foodApi.create(payload).subscribe({
        next: item => {
          this.catalog.prepend(item);
          this.closed.emit();
        },
        error: () => {
          this.error.set('Failed to save. Please try again.');
          this.submitting.set(false);
        },
      });
    }
  }
}
