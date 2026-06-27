import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { Entry } from '../../models/entry.model';

@Component({
  selector: 'app-entry-actions-sheet',
  templateUrl: './entry-actions-sheet.component.html',
  styleUrl: './entry-actions-sheet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntryActionsSheetComponent {
  entry = input.required<Entry>();
  edit = output<void>();
  delete = output<void>();
  closed = output<void>();
}
