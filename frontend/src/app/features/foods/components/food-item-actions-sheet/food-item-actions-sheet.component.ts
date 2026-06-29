import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { FoodItemRead } from '../../../../core/models/food.model';

@Component({
  selector: 'app-food-item-actions-sheet',
  templateUrl: './food-item-actions-sheet.component.html',
  styleUrl: './food-item-actions-sheet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FoodItemActionsSheetComponent {
  item = input.required<FoodItemRead>();
  edit = output<void>();
  delete = output<void>();
  closed = output<void>();
}
