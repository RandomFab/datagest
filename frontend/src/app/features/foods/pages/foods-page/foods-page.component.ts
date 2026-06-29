import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FoodApiService } from '../../../../core/services/food-api.service';
import { FoodItemRead } from '../../../../core/models/food.model';
import { FoodsCatalogService } from '../../services/foods-catalog.service';
import { AddFoodItemSheetComponent } from '../../components/add-food-item-sheet/add-food-item-sheet.component';
import { FoodItemActionsSheetComponent } from '../../components/food-item-actions-sheet/food-item-actions-sheet.component';
import { BottomNavComponent } from '../../../../layout/bottom-nav/bottom-nav.component';

type ActiveSheet = 'add' | 'actions' | 'edit' | null;

@Component({
  selector: 'app-foods-page',
  imports: [AddFoodItemSheetComponent, FoodItemActionsSheetComponent, BottomNavComponent],
  providers: [FoodsCatalogService],
  templateUrl: './foods-page.component.html',
  styleUrl: './foods-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FoodsPageComponent {
  readonly svc = inject(FoodsCatalogService);
  private readonly api = inject(FoodApiService);

  readonly activeSheet = signal<ActiveSheet>(null);
  readonly selectedItem = signal<FoodItemRead | null>(null);

  setTab(tab: 'food' | 'drink'): void {
    this.svc.activeTab.set(tab);
  }

  onSearch(value: string): void {
    this.svc.searchQuery.set(value);
  }

  onItemTapped(item: FoodItemRead): void {
    this.selectedItem.set(item);
    this.activeSheet.set('actions');
  }

  onEditItem(): void {
    this.activeSheet.set('edit');
  }

  onDeleteItem(): void {
    const item = this.selectedItem();
    if (!item) return;
    this.api.delete(item.id).subscribe({
      next: () => this.svc.remove(item.id),
    });
    this.closeSheet();
  }

  onFabClick(): void {
    if (this.activeSheet() !== null) {
      this.closeSheet();
    } else {
      this.selectedItem.set(null);
      this.activeSheet.set('add');
    }
  }

  closeSheet(): void {
    this.activeSheet.set(null);
    this.selectedItem.set(null);
  }
}
