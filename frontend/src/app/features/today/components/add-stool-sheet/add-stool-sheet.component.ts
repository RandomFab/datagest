import { Component, ChangeDetectionStrategy, output, inject, signal, input, effect } from '@angular/core';
import { TodayService } from '../../services/today.service';
import { Entry, BRISTOL_TYPES } from '../../models/entry.model';

@Component({
  selector: 'app-add-stool-sheet',
  templateUrl: './add-stool-sheet.component.html',
  styleUrl: './add-stool-sheet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddStoolSheetComponent {
  existingEntry = input<Entry | null>(null);
  closed = output<void>();

  private readonly svc = inject(TodayService);

  readonly bristolTypes = BRISTOL_TYPES;
  selectedType = signal<number | null>(null);
  entryTime = signal<string>(this.currentTime());

  constructor() {
    effect(() => {
      const e = this.existingEntry();
      if (e) {
        this.entryTime.set(e.time);
        if (e.bristolType != null) this.selectedType.set(e.bristolType);
      }
    });
  }

  get isEditing(): boolean {
    return this.existingEntry() !== null;
  }

  select(type: number): void {
    this.selectedType.set(type);
  }

  confirm(): void {
    const t = this.selectedType();
    if (t === null) return;
    const bristol = BRISTOL_TYPES.find(b => b.type === t)!;
    const entryData = {
      type: 'stool' as const,
      name: 'Bowel movement',
      detail: `Type ${t} · ${bristol.label.split(' · ')[1]}`,
      bristolType: t,
      quality: bristol.quality,
    };

    const existing = this.existingEntry();
    if (existing) {
      this.svc.updateEntry({ ...existing, ...entryData, time: this.entryTime() });
    } else {
      this.svc.addEntry({
        ...entryData,
        time: this.entryTime(),
        date: this.svc.formatDate(this.svc.currentDate()),
      });
    }
    this.closed.emit();
  }

  private currentTime(): string {
    return new Date().toTimeString().slice(0, 5);
  }
}
