import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { TodayService } from '../../services/today.service';
import { Entry, EntryType } from '../../models/entry.model';
import { TimelineEntryComponent } from '../../components/timeline-entry/timeline-entry.component';
import { SpeedDialComponent } from '../../components/speed-dial/speed-dial.component';
import { AddFoodSheetComponent } from '../../components/add-food-sheet/add-food-sheet.component';
import { AddStoolSheetComponent } from '../../components/add-stool-sheet/add-stool-sheet.component';
import { AddSymptomSheetComponent } from '../../components/add-symptom-sheet/add-symptom-sheet.component';
import { EntryActionsSheetComponent } from '../../components/entry-actions-sheet/entry-actions-sheet.component';
import { BottomNavComponent } from '../../../../layout/bottom-nav/bottom-nav.component';

type ActiveSheet = 'food' | 'drink' | 'stool' | 'symptom' | 'actions' | null;

@Component({
  selector: 'app-today-page',
  imports: [
    TimelineEntryComponent,
    SpeedDialComponent,
    AddFoodSheetComponent,
    AddStoolSheetComponent,
    AddSymptomSheetComponent,
    EntryActionsSheetComponent,
    BottomNavComponent,
  ],
  templateUrl: './today-page.component.html',
  styleUrl: './today-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodayPageComponent {
  readonly svc = inject(TodayService);

  fabOpen = signal(false);
  activeSheet = signal<ActiveSheet>(null);
  selectedEntry = signal<Entry | null>(null);

  readonly entries = this.svc.currentDateEntries;
  readonly currentDate = this.svc.currentDate;
  readonly hasNextDay = this.svc.hasNextDay;

  readonly displayDate = computed(() => this.svc.formatDisplayDate(this.currentDate()));
  readonly isToday = computed(() => this.svc.isToday(this.currentDate()));
  readonly entryCount = computed(() => this.entries().length);

  toggleFab(): void {
    if (this.activeSheet() !== null) {
      this.closeSheet();
      return;
    }
    this.fabOpen.update(v => !v);
  }

  onTypeSelected(type: EntryType): void {
    this.fabOpen.set(false);
    this.selectedEntry.set(null);
    this.activeSheet.set(type as ActiveSheet);
  }

  onEntryTapped(entry: Entry): void {
    this.selectedEntry.set(entry);
    this.activeSheet.set('actions');
  }

  onEditEntry(): void {
    const entry = this.selectedEntry();
    if (!entry) return;
    this.activeSheet.set(entry.type as ActiveSheet);
  }

  onDeleteEntry(): void {
    const entry = this.selectedEntry();
    if (!entry) return;
    this.svc.deleteEntry(entry.id);
    this.closeSheet();
  }

  closeSheet(): void {
    this.activeSheet.set(null);
    this.selectedEntry.set(null);
    this.fabOpen.set(false);
  }

  prevDay(): void {
    this.svc.goToPreviousDay();
  }

  nextDay(): void {
    if (this.hasNextDay()) {
      this.svc.goToNextDay();
    }
  }
}
